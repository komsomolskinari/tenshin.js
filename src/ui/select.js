import TJSVM from "../tjsvm";

export default class YZSelectUI {
    static async Select(data) {
        let r = await new Promise((resolve, reject) => {
            data.forEach((d, i) =>
                $('#selectlist').append(

                    $('<li>')
                        .attr('id', `select_option_${i}`)
                        .text(d.text)
                        .one('click', () => resolve(i))
                )
            )
        });
        $('#selectlist').html('');
        return data[r];
    }

    static async MSelect(data) {
        return await this.Select(data);
    }
}