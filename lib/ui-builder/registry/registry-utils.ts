/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentType as ReactComponentType } from 'react';
import { RegistryEntry } from "@/lib/ui-builder/registry/component-registry";


//Checking of component type, checked via from property, if undefined then its a primitive like <div/>, <img/>, etc
export function isPrimitiveComponent(component: RegistryEntry<ReactComponentType<any>>): boolean {
    return component.from === undefined;
  }
  
  //Checking of component type, checked via from property, if defined then its a complex component like <Button/>, <Badge/>, etc
  export function isCustomComponent(component: RegistryEntry<ReactComponentType<any>>): boolean {
    return component.from !== undefined;
  }