
const baseProps = ["date","chargedAmount","description"]

function convertTx(company,account, item) {
    let copy_obj = Object.assign({}, item)

    let base_obj = {
        "date": copy_obj["date"] ||  "1971-01-01T21:00:00.000Z",
        "cost": copy_obj["chargedAmount"] || 0,
        "info": copy_obj["description"] || ""
    };

    baseProps.forEach((key)=> {
        if (copy_obj[key])
            delete copy_obj[key];
    })

    return {
        "company": company,
        "account": account,
        "base" : base_obj,
        "extra" : copy_obj
    }
}

function groupData(company,account,arr,group_object) {
    group_object  = group_object || {};
    my_group_object = {};

    if (arr && arr.length && arr.length > 0) {
        arr
        .map(e=>[
                // "YYYY-MM"
                (new Date(e.date)).toISOString().match(/(.+-.+)-/)[1],
                // transformed item
                convertTx(company,account,e)
                ]
            )
        .forEach((e)=> {
            my_group_object[e[0]] = my_group_object[e[0]] || [];
            my_group_object[e[0]].push(e[1]);
        })

        // Remove first month in data as it may miss some data.
        //      but if we have only one month assume new account\credit-card and allow it
        my_keys = Object.keys(my_group_object).sort();
        if (my_keys.length > 1) {
            console.log("Removing first month that may have partial info - " + my_keys[0] + 
            ", Count: " +  my_group_object[my_keys[0]].length);
            delete my_group_object[my_keys[0]] // Optional, as we copy by key and we slice
            my_keys = my_keys.slice(1);
        }

        my_keys.forEach(key=> {
            group_object[key] = (group_object[key] || []).concat(my_group_object[key]);
        });
    }

    return group_object
}

function toKVArray(group_object) {
    let group_array = Object.keys(group_object).map((key) => [key, group_object[key]]);
    return group_array;
}

module.exports = {toKVArray: toKVArray, groupData: groupData };