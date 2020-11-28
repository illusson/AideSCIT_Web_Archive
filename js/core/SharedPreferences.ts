import {Map, MapForEachCallback} from "./Map";
import {Log} from "./Log";

export class SharedPreferences {
    private readonly name: string;
    private strings: Map<string, string> = new Map<string, string>();
    private numbers: Map<string, number> = new Map<string, number>();
    private booleans: Map<string, boolean> = new Map<string, boolean>();

    private constructor(name: string) {
        this.name = "sp." + name;
        const content_strings: string = localStorage.getItem(name);
        if (content_strings != null && content_strings != ""){
            const parser: Element = new DOMParser()
                .parseFromString(content_strings, "text/xml")
                .getElementsByTagName("map")[0];
            const strings = parser.getElementsByTagName("string");
            for (let i = 0; i < strings.length; i++) {
                const string = strings.item(i);
                Log.d(string.getAttribute("name"), string.textContent);
                this.strings.set(
                    string.getAttribute("name"),
                    string.textContent
                )
            }
            const numbers = parser.getElementsByTagName("number");
            for (let i = 0; i < numbers.length; i++) {
                const number = numbers.item(i);
                Log.d(number.getAttribute("name"), number.textContent);
                this.numbers.set(
                    number.getAttribute("name"),
                    Number(number.getAttribute("value"))
                )
            }
            const booleans = parser.getElementsByTagName("boolean");
            for (let i = 0; i < booleans.length; i++) {
                const boolean = booleans.item(i);
                Log.d(boolean.getAttribute("name"), boolean.textContent);
                this.booleans.set(
                    boolean.getAttribute("name"),
                    Boolean(boolean.getAttribute("value"))
                )
            }
        }
    }

    public static getInterface(name: string): SharedPreferences {
        return new SharedPreferences(name);
    }

    public getString(key: string, default_value: string): string {
        if (this.strings.has(key) != -1){
            return this.strings.get(key);
        } else {
            return default_value;
        }
    }

    public getNumber(key: string, default_value: number): number {
        if (this.numbers.has(key) != -1){
            return this.numbers.get(key);
        } else {
            return default_value;
        }
    }

    public getBoolean(key: string, default_value: boolean): boolean {
        if (this.booleans.has(key) != -1){
            return this.booleans.get(key);
        } else {
            return default_value;
        }
    }

    public edit(): SharedPreferencesEditor {
        return new SharedPreferencesEditor(
            this.name, this.strings, this.numbers, this.booleans
        );
    }
}

export class SharedPreferencesEditor {
    private readonly name: string;
    private strings: Map<string, string>;
    private numbers: Map<string, number>;
    private booleans: Map<string, boolean>;

    constructor(name: string, strings: Map<string, string>, numbers: Map<string, number>, booleans: Map<string, boolean>) {
        this.name = name;
        this.strings = strings;
        this.numbers = numbers;
        this.booleans = booleans;
    }


    public putString(key: string, value: string): SharedPreferencesEditor {
        this.strings.set(key, value);
        return this;
    }

    public putNumber(key: string, value: number): SharedPreferencesEditor {
        this.numbers.set(key, value);
        return this;
    }

    public putBoolean(key: string, value: boolean): SharedPreferencesEditor {
        this.booleans.set(key, value);
        return this;
    }

    public apply(){
        const xml_object: XMLDocument = document.implementation.createDocument(
            "", "map", null
        );
        this.strings.forEach(new class implements MapForEachCallback<string, string> {
            onEach(key: string, value: string, map: Map<string, string>) {
                const string_item = xml_object.createElement("string");
                string_item.setAttribute("name", key);
                string_item.appendChild(xml_object.createTextNode(value));
                xml_object.getElementsByTagName("map")[0]
                    .appendChild(string_item);
            }
        })
        this.numbers.forEach(new class implements MapForEachCallback<string, number> {
            onEach(key: string, value: number, map: Map<string, number>) {
                const number_item = xml_object.createElement("number");
                number_item.setAttribute("name", key);
                number_item.setAttribute("value", value.toString());
                xml_object.getElementsByTagName("map")[0]
                    .appendChild(number_item);
            }
        })
        this.booleans.forEach(new class implements MapForEachCallback<string, boolean> {
            onEach(key: string, value: boolean, map: Map<string, boolean>) {
                const boolean_item = xml_object.createElement("boolean");
                boolean_item.setAttribute("name", key);
                boolean_item.setAttribute("value", value.toString());
                xml_object.getElementsByTagName("map")[0]
                    .appendChild(boolean_item);
            }
        })
        localStorage.setItem(this.name,
            new XMLSerializer().serializeToString(xml_object));
    }
}