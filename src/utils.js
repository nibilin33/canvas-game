export const getImage = (source)=>{
    let img = new Image();
    img.src = source;
    return new Promise((resolve,reject)=>{
        img.onload = ()=>{
            resolve(img);
        }
        img.onerror = () => {
            reject();
        }
    });
}
export const isMobile = /(iPhone|iPad|iPod|iOS|Android)/i.test(navigator.userAgent);