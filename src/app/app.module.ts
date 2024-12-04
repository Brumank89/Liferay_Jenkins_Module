import {Injector, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import { HttpClientModule } from "@angular/common/http";
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {createCustomElement} from "@angular/elements";
import { TestCaseMenuComponent } from './test-case-menu/test-case-menu.component';
import { FormsModule } from '@angular/forms';
import { TestCaseService } from './test-case.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';


@NgModule({
  declarations: [
    AppComponent,
    TestCaseMenuComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    BrowserAnimationsModule,
    FormsModule,
    MatSnackBarModule
  ],
  providers: [TestCaseService]
})
export class AppModule {
  ngDoBootstrap() {}
  constructor(private injector: Injector) {
    const TestCaseMenu = createCustomElement(TestCaseMenuComponent, {
      injector: this.injector
    });
    customElements.define("test-case-menu", TestCaseMenu);
  }
}
