import { cacheClient } from "./cachDb.js"

export const setCache = async(key: string,value: string,expire: number) => {

    const result = await cacheClient.set(key,value,{
        expiration: {
            type: "PX",
            value: expire     
        }
    })
    return result;
}

export const getCache = async() => {

}