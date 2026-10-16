function formatDate(date) {
    let formatedDate = new Date(date).toLocaleDateString();
    return formatedDate;
}

export default formatDate ;