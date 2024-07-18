import { NgModule } from '@angular/core';
import { ServerModule } from '@angular/platform-server';
import { AppModule } from './app.module';
import { AppComponent } from './app.component';
import {MatInputModule} from "@angular/material/input";

@NgModule({
  imports: [
    AppModule,
    ServerModule,
      MatInputModule
  ],
  bootstrap: [AppComponent],
})
export class AppServerModule {}
