import { YZSelectData } from "../runtime/select";

export default class YZSelectUI {
    static async Select(data: YZSelectData[]) {
        const r: number = await new Promise((resolve, reject) => {
            data.forEach((d: YZSelectData, i: number) =>
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

    static async MSelect(data: YZSelectData[]) {
        return this.Select(data);
    }
}