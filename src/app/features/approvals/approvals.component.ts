import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OrbitStore } from '../../core/state/orbit.store';
import { OrbitUiService } from '../../core/ui/orbit-ui.service';

@Component({
  selector: 'app-approvals',
  imports: [FormsModule],
  templateUrl: './approvals.component.html',
})
export class ApprovalsComponent {
  protected readonly store = inject(OrbitStore);
  protected readonly assignmentSelections: Record<string, string> = {};
  private readonly ui = inject(OrbitUiService);

  protected approve(id: string): void {
    this.ui.notify(
      this.store.approveRequest(id)
        ? 'Solicitud aprobada. Tecnología ya puede asignar el equipo.'
        : 'Este perfil no tiene permiso para aprobar solicitudes.',
    );
  }

  protected reject(id: string): void {
    this.ui.notify(
      this.store.rejectRequest(id)
        ? 'Solicitud rechazada y registrada en auditoría.'
        : 'Este perfil no tiene permiso para rechazar solicitudes.',
    );
  }

  protected assign(requestId: string): void {
    const assetId = this.assignmentSelections[requestId];
    if (!assetId) {
      this.ui.notify('Selecciona un activo disponible.');
      return;
    }

    this.ui.notify(
      this.store.assignAsset(requestId, assetId)
        ? 'Activo asignado. El onboarding quedó completado.'
        : 'Usa el perfil Tecnología y verifica que el activo siga disponible.',
    );
  }
}
