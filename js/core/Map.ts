import {Log} from "./Log";

export class Map<K, V> {
    private keys: K[] = [];
    private values: V[] = [];

    public set(key: K, value: V): Map<K, V> {
        let index: number = -1;
        if (!this.has(key, index)){
            this.keys.push(key);
            this.values.push(value);
        } else {
            this.values[index] = value;
        }
        return this;
    }

    public has(key: K, index: &number = -1): boolean {
        this.keys.forEach(function (v, i, a) {
            if (v == key){
                index = i;
            }
        })
        return index != -1;
    }

    public get(key: K): V {
        const index: number = -1;
        if (this.has(key, index)){
            return null;
        } else {
            return this.values[index];
        }
    }

    public delete(key: K): boolean {
        const index: number = -1;
        if (this.has(key, index)){
            return false;
        } else {
            this.keys.splice(index, 1);
            this.values.splice(index, 1);
            return true;
        }
    }

    public forEach(callback: MapForEachCallback<K, V>){
        for (let i: number = 0; i < this.keys.length; i++){
            callback.onEach(this.keys[i], this.values[i], this);
        }
    }
}

export interface MapForEachCallback<K, V> {
    onEach(key: K, value: V, map: Map<K, V>)
}