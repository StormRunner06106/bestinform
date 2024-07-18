import {Pipe, PipeTransform} from '@angular/core';
import {TranslateService} from "@ngx-translate/core";

@Pipe({
    name: 'valueTypeTransform'
})
export class ValueTypeTransformPipe implements PipeTransform {

    constructor(private translate: TranslateService) {
    }
    transform(valueType: string): string {
        if (valueType === "text") {
            return "Text";
        } else if (valueType === "number") {
            return this.translate.instant("VALUE-TYPE.NUMBER");
        } else if (valueType === "textarea") {
            return this.translate.instant("VALUE-TYPE.TEXTAREA");
        } else if (valueType === "select") {
            return this.translate.instant("VALUE-TYPE.SELECT");
        }else if (valueType === "multiple-select") {
            return this.translate.instant("VALUE-TYPE.MULTIPLE-SELECT");
        }else{
            return valueType;
        }
    }

}
