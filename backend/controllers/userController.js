const User = require("../models/userSchema");
const bcrypt = require("bcrypt");
const { generateJWT } = require("../utils/generateToken");


async function createUser(req, res) {
    const {name, email, password} = req.body;

    try {
        if(!name) {
            return res.status(400).json({
            success : false,
            message : "please fill the name"
        })
        }

        if(!email) {
            return res.status(400).json({
            success : false,
            message : "please fill the email"
        })
        }

        if(!password) {
            return res.status(400).json({
            success : false,
            message : "please fill the password"
        })
        }

        let alreadyExist = await User.findOne({email});
        if(alreadyExist != null) {
            return res.status(400).json({success : false, message : "user already exist"})
        }

        const hashPassword = await bcrypt.hash(password, 10);
        console.log(hashPassword)

        const newUser = await User.create({
            name : name,
            email : email,
            password : hashPassword
        })

        let token = await generateJWT({email : newUser.email, id : newUser._id});

        return res.status(200).json({
            success : true,
            message : "user created successfully",
            user : {
                id : newUser._id,
                name : newUser.name,
                email : newUser.email,
                token : token,
            },
        })
    } 

    catch (error) {
        return res.status(500).json({
            success : false,
            message : "SOMETHING WENT WROMG WHILE CREATING USER!!!",
            error : error.message
        })
    }

}

async function login(req, res) {
    const {email, password} = req.body;

    try {
        let alreadyExist = await User.findOne({email});
        if(alreadyExist == null) {
            return res.status(400).json({success : false, message : "user not exist"})
        }        

        const checkPassword = await bcrypt.compare(password, alreadyExist.password);
        if(checkPassword == false)  {
            return res.status(400).json({
                success : false,
                message : "Incorrecrt Password"
            })
        }

        let token = await generateJWT({email : alreadyExist.email, id : alreadyExist._id});

        return res.status(200).json({
            success : true,
            message : "user logged in successfully",
            user : {
                id : alreadyExist._id,
                name : alreadyExist.name,
                email : alreadyExist.email,  
                token
            },
        })
    } 

    catch (error) {
        return res.status(500).json({
            success : false,
            message : "SOMETHING WENT WROMG WHILE CREATING USER!!!",
            error : error.message
        })
    }

}

async function getAllUsers(req, res) {
    try {
        let users = await User.find({});
        if(users.length == 0)
            return res.status(200).json({
            success : false,
            meassage : "Please create users before fetching them",
        })


        return res.status(200).json({
            success : true,
            meassage : "user fetched successfully",
            users : users
        }); 
    } 
    catch (error) {
        return res.status(500).json({
            success : false,
            message : "SOMETHING WENT WROMG WHILE FETCHING USER!!!"
        })
    }
}

async function getUserById(req, res) {
    let id = req.params.id;

    try {     
        // let user = await User.findById(id);  //when we increase or decrease the length of id then it throw error taht is written in catch
        // OR

        let user = await User.find({_id : id});   //by using this it will give the error that is written in if(!user) bcauz in findById we are getting in form of object. so it throw different error.

         if(!user) {
            return res.status(200).json({
            success : false,
            meassage : "Please create users before fetching them"
        })
        }

        console.log(user._id);      //out => new ObjectId('6a7b0b18734d4481545d515b')
        console.log(user.id);       //out => 6a7b0b18734d4481545d515b
            
        return res.status(200).json({
            success : true,
            meassage : "user fetched successfully",
            user : user
        }); 
    } 
    catch (error) {
        return res.status(500).json({
            success : false,
            message : "SOMETHING WENT WROMG WHILE FETCHING USER!!!"
        })
    }
}

async  function updateUser(req, res) {
    try {
        let id = req.params.id;
        let user = await User.findByIdAndUpdate(id, {$set : req.body}, {new : true});

        if(!user) {
            return res.status(400).json({
                status : false,
                meassage : "user not found"
            })
        }

        return res.status(200).json({
            success: true,
            message: "User updated successfully",
            user
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong while updating user"
        });
    }
}

async function deleteUser(req, res) {
    try {
        const id = req.params.id;

        let user = await User.findByIdAndDelete({_id : id});
        if(!user) {
            return res.status(400).json({
                status : false,
                meassage : "user not found"
            })
        }

        return res.status(200).json({
            success: true,
            message: "User deleted successfully"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong while deleting user"
        });
    }
}

module.exports = {createUser, getAllUsers, getUserById, updateUser, deleteUser, login};