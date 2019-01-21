import { SelectData } from "../runtime/select";
import { createElem, getElem } from "../utils/dom";

export default class SelectUI {
    static async Select(data: SelectData[]) {
        const r: number = await new Promise((resolve, reject) => {
            data.forEach((d: SelectData, i: number) => {
                const elem = createElem("li", `select_option_${i}`) as HTMLLIElement;
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
