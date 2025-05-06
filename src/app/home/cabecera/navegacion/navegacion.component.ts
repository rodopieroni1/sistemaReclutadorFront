import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-navegacion',
  imports: [RouterModule],
  templateUrl: './navegacion.component.html',
  styleUrl: './navegacion.component.css',
})
export class NavegacionComponent implements OnInit {
  userLoginOn: boolean = false;
  ngOnInit(): void {}
}
