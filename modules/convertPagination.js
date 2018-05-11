const convertPagination = function (items, currentPage) {
    //分頁
    const totalResult = items.length;
    const perPage = 10;
    const totalPage = Math.ceil(totalResult / perPage);
    if (currentPage > totalPage) {
        currentPage = totalPage;
    }
    let minItem = (currentPage - 1) * perPage + 1;
    let maxItem = currentPage * perPage;
    const data = [];
    items.forEach((article, i) => {
        let item = i + 1;
        if (item >= minItem && item <= maxItem) {
            data.push(article);
        }
    })
    const page = {
        totalPage,
        currentPage,
        hasPre: currentPage === 1,
        hasNext: currentPage === totalPage
    }

    return {
        page,
        data
    }
};

module.exports = convertPagination;