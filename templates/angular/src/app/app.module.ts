import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { services } from '{{service.dir}}';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [
  ].concat(services),
  bootstrap: [AppComponent]
})
export class AppModule { }
