import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Role } from '../../../models/role.model';
import * as RoleActions from '../store/master.action';
import { selectAllRoles } from '../store/master.selector';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-role',
  templateUrl: './role.component.html',
  styleUrls: ['./role.component.css']
})
export class RoleComponent implements OnInit {
  roles$!: Observable<Role[]>;
  dataSource = new MatTableDataSource<Role>([]);
  displayedColumns: string[] = ['name', 'actions'];

  isEditMode = false;
  editRoleId: string | null = null;
  newRoleName: string = '';
  isSaving = false;

  constructor(private store: Store) {}

  ngOnInit(): void {
    this.store.dispatch(RoleActions.loadRoles());
    this.roles$ = this.store.select(selectAllRoles);

    
    this.roles$.subscribe((roles) => {
      console.log('data', roles);
      this.dataSource.data = roles;
    });
  }

  addRole() {
    if (!this.newRoleName.trim()) return;
    this.isSaving = true;
    const newRole = { name: this.newRoleName.trim() };
    this.store.dispatch(RoleActions.addRole({ role: newRole }));
    this.resetForm();
    this.isSaving = false;
  }

  updateRole() {
    if (!this.editRoleId || !this.newRoleName.trim()) return;
    this.isSaving = true;
    const updatedRole = { name: this.newRoleName.trim() };
    this.store.dispatch(RoleActions.updateRole({ id: this.editRoleId, role: updatedRole }));
    this.resetForm();
    this.isSaving = false;
  }

  startEdit(role: Role) {
    this.isEditMode = true;
    this.editRoleId = role._id;
    this.newRoleName = role.name;
  }

  deleteRole(id: string) {
    this.store.dispatch(RoleActions.deleteRole({ id }));
  }

  cancelAction() {
    this.resetForm();
  }

  private resetForm() {
    this.newRoleName = '';
    this.editRoleId = null;
    this.isEditMode = false;
  }
}
