// src/app/core/core.module.ts
import { NgModule } from "@angular/core";
import {AuthService} from './services/auth.service';
import {AuthGuard} from './guards/auth.guard';

NgModule({
    providers: [AuthService, AuthGuard]
})
export class CoreModule {}