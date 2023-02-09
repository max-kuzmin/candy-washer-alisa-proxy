import fetch from "node-fetch";

export function fetchXForm(details, url) {
    const formBody: string[] = [];
    for (let property in details) {
        let encodedKey = encodeURIComponent(property);
        let encodedValue = encodeURIComponent(details[property]);
        formBody.push(encodedKey + "=" + encodedValue);
    }
    const formBodyString = formBody.join("&");
    //console.log(formBody);
    
    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formBodyString,
      //redirect: 'manual'
    })
}