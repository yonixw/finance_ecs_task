
const { deltaTxnObj } = require("./diff_txtns")

const mockCompanies = [
    {
        "company": "isracard",
        "account": "0123"
    },
    {
        "company": "hapoalim",
        "account": "00-123-123777"
    }
]

const mockDates = [
    "2022-06-01T00:00:00.000Z",
    "2022-06-01T01:00:00.000Z",
    "2022-06-01T00:01:00.000Z",
    "2022-06-01T00:00:01.000Z",
    "2022-06-02T00:00:00.000Z",
    "2022-06-02T20:00:00.000Z",
    "2022-06-02T00:20:00.000Z",
    "2022-06-02T00:00:20.000Z",
]

const mockShops = [
    "Store A",
    "חנות א",
    "'בחנות ב",
    "דירקט- מצטבר"
]

function mockTxn(id, companyID, dateID, shopID, cost, costRealMul = 1, status = "completed") {
    return {
        ...mockCompanies[companyID],
        "basic": {
            "date": mockDates[dateID],
            "cost": -1 * cost,
            "type": costRealMul > 1 ? "ILS+EXT" : "ILS",
            "info": mockShops[shopID]
        },
        "extra": {
            "type": "normal",
            "identifier": id,
            "processedDate": mockDates[dateID],
            "originalAmount": -1 * cost * costRealMul,
            "originalCurrency": costRealMul > 1 ? "ILS+EXT" : "ILS",
            "memo": "",
            "status": status
        }
    }
}

describe('diff txn', () => {

    test('simple add/rem', () => {

        const obj_1_A = [
            mockTxn(4540797, 0, 1, 0, 83.9),
            mockTxn(4540798, 0, 1, 1, 83.9),
        ]

        const diff = [mockTxn(4540799, 0, 1, 2, 83)]

        const obj_1_B = obj_1_A.concat(diff)

        expect(obj_1_A.length).toBe(obj_1_B.length - 1);

        // Check symmetry
        expect(deltaTxnObj(obj_1_A, obj_1_B)).toEqual(diff)
        expect(deltaTxnObj(obj_1_B, obj_1_A)).toEqual(diff)
    })

    test('uniqe in each', () => {

        const base = [mockTxn(4540797, 0, 1, 0, 83.9)]
        const obj_1_A = base.concat([mockTxn(4540798, 0, 1, 1, 70)])
        const obj_1_B = base.concat([mockTxn(4540798, 0, 1, 1, 75)])

        const diff = [mockTxn(4540798, 0, 1, 1, 70), mockTxn(4540798, 0, 1, 1, 75)]

        // Check symmetry
        expect(deltaTxnObj(obj_1_A, obj_1_B)).toEqual(diff)
        expect(deltaTxnObj(obj_1_B, obj_1_A)).toEqual(diff.reverse())
    })

    test('repeated+1', () => {

        const base = [mockTxn(4540797, 0, 1, 0, 83.9)]
        const obj_1_A = base.concat(base).concat(base).concat(base)
        const obj_1_B = base.concat(base).concat(base).concat(base).concat(base)

        const diff = base

        // Check symmetry
        expect(deltaTxnObj(obj_1_A, obj_1_B)).toEqual(diff)
        expect(deltaTxnObj(obj_1_B, obj_1_A)).toEqual(diff)
    })

    test('repeated+2', () => {

        const base = [mockTxn(4540797, 0, 1, 0, 83.9)]
        const obj_1_A = base.concat(base).concat(base).concat(base)
        const obj_1_B = base.concat(base).concat(base).concat(base).concat(base).concat(base)

        // report diff once even if duplication is +2
        const diff = base

        // Check symmetry
        expect(deltaTxnObj(obj_1_A, obj_1_B)).toEqual(diff)
        expect(deltaTxnObj(obj_1_B, obj_1_A)).toEqual(diff)
    })
})