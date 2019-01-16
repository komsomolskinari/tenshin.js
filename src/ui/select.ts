import { SelectData } from "../runtime/select";
import * as $ from "jquery";

export default class YZSelectUI {
    static async Select(data: SelectData[]) {
        const r: number = await new Promise((resolve, reject) => {
            data.forEach((d: SelectData, i: number) =>
                $("#selectlist").append(
                    $("<li>")
                        .attr("id", `select_option_${i}`)
                        .text(d.text)
                        .one("click", () => resolve(i))
                )
            );
        });
        $("#selectlist").html("");
        return data[r];
    }

    static async MSelect(data: SelectData[]) {
        return this.Select(data);
    }
}
