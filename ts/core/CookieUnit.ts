import {Map} from "./Map";

export class CookieUnit {
    public static set(key: string, value: string, expired: Date = null, path: string = null){
        let cookie = key + "=" + value;
        if (expired != null){
            cookie += "; expired=" + expired.toUTCString();
        }
        if (path != null){
            cookie += "; path=" + path;
        }
        cookie += ";";
        document.cookie = cookie;
    }

    public static remove(key: string){
        document.cookie = key + "=; expired=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    }

    public static get(key: string, value: &string[] = []): number {
        const cookies = CookieUnit.getAll();
        if (cookies.has(key)){
            value = cookies.get(key);
            return value.length;
        } else {
            return 0;
        }
    }

    public static getAll(): Map<string, string[]> {
        const cookie_strings: string[] = document.cookie.split("; ")
        const cookies: Map<string, string[]> = new Map<string, string[]>();
        cookie_strings.forEach(function (value, index, array) {
            const cookie: string[] = value.split("=");
            let cookie_string: string[] = [];
            if (cookies.has(cookie[0])){
                cookie_string = cookies.get(cookie[0])
            }
            cookie_string.push(cookie[1]);
            cookies.set(cookie[0], cookie_string)
        })
        return cookies;
    }
}