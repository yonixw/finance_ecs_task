function txn2id(txn) {
    return [
        (txn.extra.identifier || "id"),
        txn.basic.date,
        txn.basic.cost,
        txn.basic.info,
        txn.extra.originalAmount || txn.basic.cost,
        txn.extra.status || "completed"
    ].join('|')
}

function deltaTxnObj(arrA = [], arrB = []) {
    let diff = [];

    const directCheckExistA = {};
    const arrAwKeys = arrA.map(e => [txn2id(e), e]);
    arrAwKeys.forEach(e => { directCheckExistA[e[0]] = (directCheckExistA[e[0]] || 0) + 1 })

    const directCheckExistB = {};
    const arrBwKeys = arrB.map(e => [txn2id(e), e]);
    arrBwKeys.forEach(e => { directCheckExistB[e[0]] = (directCheckExistB[e[0]] || 0) + 1 })

    /*
    A:
        if A=B (count) none
        if A!=B , added 
        if A, no B, added

    B:
        if B, no A, added.
        other not needed, done by A.
    */

    //console.log({ directCheckExistA, directCheckExistB, diff })

    for (let i = 0; i < arrAwKeys.length; i++) {
        const key = arrAwKeys[i][0];
        const txn = arrAwKeys[i][1];
        if (directCheckExistB[key]) {
            if (directCheckExistB[key] !== directCheckExistA[key]) {
                diff.push(txn);

                // Equal it so next instances will ignore diff in count
                directCheckExistA[key] = directCheckExistB[key]
            }
        }
        else {
            diff.push(txn)
        }
    }

    for (let i = 0; i < arrBwKeys.length; i++) {
        const key = arrBwKeys[i][0];
        const txn = arrBwKeys[i][1];
        if (!directCheckExistA[key]) {
            diff.push(txn)
        }
    }



    return diff;
}

module.exports = { deltaTxnObj }