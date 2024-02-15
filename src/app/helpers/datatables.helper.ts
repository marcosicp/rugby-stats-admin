import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs/internal/Subject';

export function refreshDataTable(dataTableElement: DataTableDirective, dataTableTrigger: Subject<void>, forceClear?: boolean) {
  clearDataTable(dataTableElement, forceClear).then(() => {
    dataTableTrigger.next();
  });
}

export function clearDataTable(dataTableElement: DataTableDirective, force?: boolean) {
  return new Promise((resolve, reject) => {
    if (dataTableElement.dtInstance) {
      dataTableElement.dtInstance.then((dtInstance: DataTables.Api) => {
        if (force || dtInstance.data().any()) {
          dtInstance.clear().destroy();
        }
        resolve();
      });
    } else {
      resolve();
    }
  });
}


//  export function rerender(dtElements): void {     
//     dtElements.forEach((dtElement: DataTableDirective) => {
//       if(dtElement.dtInstance)
//         dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
//           dtInstance.destroy();          
//       });
//     });
//     // this.dataTableTriggerJugadores.next(); 
//     // this.dataTableTriggerFormacion.next();    
//   }
