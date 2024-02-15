import { Component, OnInit } from '@angular/core';
import { slugify } from '../../../helpers/functions.helper';
import { AlertService } from '../../../services/alert.service';
import { NavigationService } from '../../../services/navigation.service';
import { DivisionesService } from '../../../services/collections/divisiones.service';

@Component({
  selector: 'fa-pages-add',
  templateUrl: './divisiones-add.component.html',
  styleUrls: ['./divisiones-add.component.css']
})
export class DivisionesAddComponent implements OnInit {

  title: string;
  slug: string;

  constructor(
    private divisiones: DivisionesService,
    private alert: AlertService,
    private navigation: NavigationService
  ) { }

  ngOnInit() {
  }

  addDivision(event: Event) {
    const addButon = event.target as any;
    const startLoading = () => {
      addButon.isLoading = true;
    };
    const stopLoading = () => {
      addButon.isLoading = false;
    };
    startLoading();
        // Add equipo
        this.divisiones.add({
          title: this.title,
          equipos: []
        }).then(() => {
          this.alert.success("División agregado correctamente!", false, 5000, true);
          this.navigation.redirectTo('equipos', 'list');
        }).catch((error: Error) => {
          this.alert.error(error.message);
        }).finally(() => {
          stopLoading();
        });
      }

}
