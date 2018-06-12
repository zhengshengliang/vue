import HTTP from '@lib/http';

export function BomList(data, cataData) {
    return HTTP.post({
        url: '/ajax/onb/bom/list',
        data,
        cataData
    })
}

export function BomOneList(bomId, data, catData) {
    return HTTP.get({
        url: `/ajax/onb/bom/${bomId}/detail/list`,
        data,
        catData
    })
}

export function BomOff(bomId, data, catData) {
    return HTTP.post({
        url: `/ajax/onb/bom/${bomId}/stop`,
        data,
        catData
    })
}

export function BomOn(bomId, data, catData) {
    return HTTP.post({
        url: `/ajax/onb/bom/${bomId}/use`,
        data,
        catData
    })
}

export function BomDel(bomId, data, catData) {
    return HTTP.post({
        url: `/ajax/onb/bom/${bomId}/delete`,
        data,
        catData
    })
}

export function BomOneDel(detailId, data, catData) {
    return HTTP.post({
        url: `/ajax/onb/bom/detail/${detailId}/delete`,
        data,
        catData
    })
}

export function BomHeader(bomCode, data, catData) {
    return HTTP.get({
        url: `/ajax/onb/bom/${bomCode}/get`,
        data,
        catData
    })
}

export function BomNew(data, catData) {
    return HTTP.post({
        url: '/ajax/onb/bom/save',
        data,
        catData
    })
}

export function BomUpdate(bomCode, data, catData) {
    return HTTP.post({
        url: `/ajax/onb/bom/${bomCode}/update`,
        data,
        catData
    })
}

export function BomCommodity(data, catData) {
    return HTTP.post({
        url: '/ajax/bas/query_commodity',
        data,
        catData
    })
}

export function BomRelevance(bomId, data, catData) {
    return HTTP.get({
        url: `/ajax/onb/bom/${bomId}/has_relevance`,
        data,
        catData
    })
}
