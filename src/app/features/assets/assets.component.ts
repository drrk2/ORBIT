import { Component, computed, inject } from '@angular/core';
import { Asset } from '../../core/models/orbit.models';
import { OrbitStore } from '../../core/state/orbit.store';
import { OrbitUiService } from '../../core/ui/orbit-ui.service';
import { statusClass } from '../../shared/status-class';

@Component({
  selector: 'app-assets',
  templateUrl: './assets.component.html',
})
export class AssetsComponent {
  protected readonly store = inject(OrbitStore);
  protected readonly ui = inject(OrbitUiService);
  protected readonly statusClass = statusClass;
  protected readonly filteredAssets = computed(() => {
    const term = this.ui.searchTerm().trim().toLowerCase();
    if (!term) return this.store.assets();
    return this.store
      .assets()
      .filter((asset) =>
        [asset.id, asset.type, asset.brand, asset.model, asset.serial, asset.status]
          .join(' ')
          .toLowerCase()
          .includes(term),
      );
  });

  protected returnAsset(asset: Asset): void {
    this.ui.notify(
      this.store.returnAsset(asset)
        ? `${asset.id} volvió al inventario disponible.`
        : 'Usa el perfil Tecnología para devolver activos.',
    );
  }
}
