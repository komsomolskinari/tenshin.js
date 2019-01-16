import { SelectData } from "../runtime/select";
import { getElem } from "../utils/util";

export default class YZSelectUI {
    static async Select(data: SelectData[]) {
        const r: number = await new Promise((resolve, reject) => {
            data.forEach((d: SelectData, i: number) => {
                const elem: HTMLLIElement = document.createElement("li");
                elem.id = `select_option_${i}`;
                elem.innerText = d.text;
                const cb = () => {
                    elem.removeEventListener("click", cb);
                    resolve(i);
                };
                elem.addEventListener("click", cb);
                getElem("#selectlist").appendChild(elem);
            });
        });
        getElem("#selectlist").innerHTML = "";
        return data[r];
    }

    static async MSelect(data: SelectData[]) {
        return this.Select(data);
    }
}
