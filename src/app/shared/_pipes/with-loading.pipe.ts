import { Pipe, PipeTransform } from '@angular/core';
import {catchError, isObservable, Observable, of, startWith} from "rxjs";
import {map} from "rxjs/operators";

@Pipe({
  name: 'withLoading',
  standalone: true
})
export class WithLoadingPipe implements PipeTransform {

  transform<T>(val: Observable<T>) {
    return val.pipe(
            map((value: any) => ({ loading: value?.loading, ...value })),
            startWith({ loading: true }),
            catchError(error => of({ loading: false, error }))
        ) as Observable<T & {loading: boolean, error?: unknown}>;
  }

}
