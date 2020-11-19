export class JSONObject {
    private object: any;

    constructor(str: string) {
        try {
            this.object = JSON.parse(str);
        } catch (e) {
            if (e instanceof SyntaxError){
                throw new JSONException(e.message, e.name)
            }
        }
    }

    public isNull(key: string): boolean {
        return this.object.has();
    }
}

class JSONArray {

}

class JSONException extends DOMException { }