import { useSensors, useSensor, MouseSensor, TouchSensor } from '@dnd-kit/core';

export const useDndSensors = () => {
  return useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 4,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 100,
        tolerance: 8,
      },
    })
  );
}; 