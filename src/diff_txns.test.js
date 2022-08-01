
const mockCompanies = [
    {
        "company": "isracard",
        "account": "0123"
    },
    {
        "company": "hapoalim",
        "account": "00-123456-123"
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
    "'בחנות ב"
]

function mockTxn(id, companyID, dateID, shopID, cost, costRealMul = 1, status = "completed") {
    return {
        ...mockCompanies[companyID],
        "basic": {
            "date": mockDates[dateID],
            "cost": -1 * cost,
            "type": "ILS",
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

    const obj_1_A = [
        mockTxn(4540797, 0, 1, 0, 83.9),
        mockTxn(4540798, 0, 1, 1, 83.9),
    ]

    const diff = mockTxn(4540799, 0, 1, 2, 83);

    const obj_1_B = obj_1_A.concat(diff)

    test('simple add', () => {
        expect(obj_1_A.length).toBe(obj_1_B.length - 1);

    })
})