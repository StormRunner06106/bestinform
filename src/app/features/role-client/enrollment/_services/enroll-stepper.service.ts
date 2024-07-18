import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject} from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class EnrollStepperService {


    // Stepper
    step$ = new BehaviorSubject(0);
    stepsTitle$ = new BehaviorSubject([
        {id: 0, stepName: 'Welcome'},
        {id: 1, stepName: 'Attributes'},
        {id: 2, stepName: 'Data'},
        {id: 3, stepName: 'Finish'}
    ]);

    stepperStage$ = new BehaviorSubject('Add');
    // stepperStage$ = new BehaviorSubject('Configure/Edit');


    constructor(private http: HttpClient) {
        // Listen to Step Stage Changes
        // this.getStepperStage().subscribe({
        //     next: stage => {
        //         console.log('stage', stage);
        //         this.changeStepperStage(stage)
        //     }
        // })
    }


    /** Stepper Listener*/
    getStep() {
        return this.step$.asObservable()
    }

    getStepsTitle() {
        return this.stepsTitle$.asObservable()
    }

    getStepperStage() {
        return this.stepperStage$.asObservable()
    }

    /** Go to next step*/
    nextStep() {

        // Check if you get to the last step
        if (this.step$.getValue() === this.stepsTitle$.getValue()[this.stepsTitle$.getValue().length - 1].id) {
            return
        }

        // Go one step forward
        this.step$.next(this.step$.getValue() + 1);

    }

    /** Go to previous step*/
    prevStep() {

        // Check if you get to the first step
        if (this.step$.getValue() === this.stepsTitle$.getValue()[0].id) {
            return
        }

        // Go one step back
        this.step$.next(this.step$.getValue() - 1)

    }

    /** Change Stepper Stage*/
    changeStepperStage(stage) {
        if (stage === 'Add') {
            return this.stepsTitle$.next([
                {id: 0, stepName: 'Domeniul'},
                {id: 1, stepName: 'Categorie resurse'},
                {id: 2, stepName: 'Tipul de resursă'},
                {id: 3, stepName: 'Configurație'}
            ])
        } else if (stage === 'Configure/Edit') {
            return this.stepsTitle$.next([
                {id: 0, stepName: 'Informatii generale'},
                {id: 1, stepName: 'Facilități'},
                {id: 2, stepName: 'Setup'},
                {id: 3, stepName: 'Politici'},
                {id: 4, stepName: 'Galerie'},
                {id: 5, stepName: 'Payment'}
            ])
        }
    }


}
