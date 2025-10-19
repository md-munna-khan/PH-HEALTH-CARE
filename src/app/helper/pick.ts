const pick=<T extends Record<string,unknown>,k extends keyof T> (obj:T,keys:k[]):Partial<T>=>{

    const finalOject:Partial<T>={};
   for(const key of keys){
    if(obj && Object.hasOwnProperty.call(obj,key)){
        finalOject[key]=obj[key]
    }
   }
 return finalOject
}
export default pick