import {Component, OnInit} from '@angular/core';
import {AttributesService} from "../../_services/attributes.service";
import {EnrollStepperService} from "../../_services/enroll-stepper.service";
import { UserDataService } from 'src/app/shared/_services/userData.service';
import { User } from 'src/app/shared/_models/user.model';
import { ToastComponent } from 'src/app/theme/components/toast/toast.component';
import { ToastService } from 'src/app/shared/_services/toast.service';

@Component({
    selector: 'app-client-preferences',
    templateUrl: './client-preferences.component.html',
    styleUrls: ['./client-preferences.component.scss']
})
export class ClientPreferencesComponent implements OnInit {

    allAttributes = [];
    categories = [];
    preferences = [];
    currentUser: User;

    constructor(private attributesService: AttributesService,
                private stepperService: EnrollStepperService,
                private dataService: UserDataService,
                private toastService:ToastService) {
    }

    ngOnInit() {
        this.getAttributesForEnrollment();
    }

    getAttributesForEnrollment() {
        const filter = {
            enrollment: true
        }
        this.attributesService.listAttributesFiltered(0, -1, null, null, null, filter).subscribe({
            next: (attributes: any) => {
                console.log('ATTRIBUTES', attributes.content);
                this.allAttributes = attributes.content;
            }
        })
    }

    addValue(attributeId: string, value: string) {
        console.log(attributeId, value)
        const attrIndex = this.allAttributes.findIndex(attr => attr.id === attributeId);
        if (attrIndex !== -1) {
            const valueIndex = this.allAttributes[attrIndex].valueOptions.findIndex(val => val === value);
            if (valueIndex !== -1) {
                this.allAttributes[attrIndex].valueOptions[valueIndex] = {
                    val: value,
                    selected: true
                }
            }
        }
    }

    deleteValue(attributeId: string, value: string) {
        const attrIndex = this.allAttributes.findIndex(attr => attr.id === attributeId);
        if (attrIndex !== -1) {
            const valueIndex = this.allAttributes[attrIndex].valueOptions.findIndex(valToCheck => valToCheck.val === value);
            if (valueIndex !== -1) {
                this.allAttributes[attrIndex].valueOptions[valueIndex] = value;
            }
        }

    }

    makePreferencesArray() {
        this.preferences = [];
        console.log(this.allAttributes)
        this.allAttributes.forEach(attribute => {
            // console.log(attribute);
            attribute.valueOptions.forEach(value => {
                // console.log(value);
                if (value.selected) {
                    const attributeIndex = this.preferences.findIndex(pref => pref.attributeId === attribute.id);
                    console.log(attributeIndex)
                    if (attributeIndex === -1) {
                        // const attributePref =
                        this.preferences.push({
                            attributeId: attribute.id,
                            attributeValues: [{
                                attributeValue: value.val,
                                score: 0
                            }]
                        });
                        console.log(this.preferences);
                        // this.checkIfData();
                        // this.attributesService.preferences$.next(this.preferences);

                        // console.log('preferinte', this.preferences);
                    } else {
                        this.preferences[attributeIndex].attributeValues.push({
                            attributeValue: value.val,
                            score: 0
                        });
                        // console.log('preferinte din else', this.preferences);
                        // this.attributesService.preferences$.next(this.preferences);


                    }
                    console.log('preferinte:', this.preferences);
                    // this.attributesService.preferences$.next(this.preferences);

                }
            })

        })
    }

    checkIfData(){
        // console.log('avem atribute?',this.attributesService.preferences$.getValue());
        const selectedPreferences=this.attributesService.preferences$.getValue();
        console.log('selected pref', selectedPreferences);
        if (selectedPreferences.length >0) {
            selectedPreferences.forEach(attribute => {
                // this.addValue(attribute.attributeId, attribute.attributeValues)

                attribute.attributeValues.forEach(attr => {
                    console.log('attr:',attr);
                    this.addValue(attribute.attributeId, attr.attributeValue)
                });
                
            });
        }       
     }

    //Function to divide all attributes by categories
    // divideCategories(attributes){
    //     attributes.forEach(attribute => {
    //         const indexOfCateg = this.categories.findIndex(categ => categ.categoryId === attribute.categoryId);
    //         if(indexOfCateg === -1){
    //             const category = {
    //                 categoryId: attribute.categoryId,
    //                 attributes: [attribute]
    //             }
    //             this.categories.push(category);
    //         }else{
    //             this.categories[indexOfCateg].attributes.push(attribute);}
    //
    //         console.log(this.categories);
    //     })
    // }

    nextStep() {
        this.makePreferencesArray();
         this.attributesService.preferences$.next(this.preferences);
        // this.checkIfData();
        
        this.stepperService.nextStep();

    }

    skipStep() {
        this.stepperService.nextStep();
        this.attributesService.preferences$.next([]);
    }

    prevStep() {
        this.attributesService.preferences$.next(this.preferences);
        this.stepperService.prevStep();
    }
}
