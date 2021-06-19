import { AbstractControl } from '@angular/forms';


export const passwordConfirming = (c: AbstractControl): { confirm: boolean } => {
  const parent = c.parent;
  if(!parent) return;
  let passwordControl = parent.get('password');
  let confirmPasswordControl = parent.get('confirmPassword');
  let password = passwordControl.value == undefined ? '' : passwordControl.value;
  let confirmpassword = confirmPasswordControl.value == undefined ? '' : confirmPasswordControl.value;
  if (password !== confirmpassword) {
    return { confirm: true };
  }
}

export const requiredField = (c: AbstractControl): { required: boolean } => {
  const value = c.value as string;
  if(value == null) return;

  if(value.trim() == '') {
    return { required: true };
  }
}


export const preventArrowKeyChange = (e: KeyboardEvent) => {
  if(e.keyCode == 40 || e.keyCode == 38) {
    e.preventDefault();
  }
}

export const validNumber = (c: AbstractControl): { isNan: boolean } => {
  const value = c.value;
  if(isNaN(value)) {
    return {
      isNan: true,
    }
  }
}

export const validAmount = (c: AbstractControl): { currency: boolean } => {
  const value = c.value;
  // if() return;
  const filterValue = value.replace(/\,/ig, '');
  if(isNaN(filterValue)) {
    return {
      currency: true,
    }
  }
} 

export const negativeValidator = (c: AbstractControl): { negative: boolean } => {
  const value = c.value;
  if(value == '') return;
  let valueNo = parseFloat(value);
  if(valueNo < 0 || isNaN(valueNo)) {
    return { negative: true };
  }
}