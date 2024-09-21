
import React, { useEffect, useState, useMemo, useRef } from 'react';
import { GripVertical } from 'lucide-react';
import { createSwapy, SlotItemMap, Swapy } from 'swapy'; 

// Define the shape of each item
interface DraggableListItem {
  id: string;
  reactElement: React.ReactElement;
}

// Define the props for DraggableList
interface DraggableListProps {
  items: DraggableListItem[];
  onOrderChange: (newOrder: DraggableListItem[]) => void;
}

const DraggableList: React.FC<DraggableListProps> = ({ items, onOrderChange }) => {
  const swapyRef = useRef<Swapy | null>(null);

  // Initialize slotItemsMap based on items prop
  const [slotItemsMap, setSlotItemsMap] = useState<SlotItemMap>(() => [
    ...items.map(item => ({
      slotId: item.id,
      itemId: item.id
    })),
    // Optionally, define an empty slot
    { slotId: `empty-${Math.round(Math.random() * 99999)}`, itemId: null }
  ]);

  // Memoize the slotted items for performance optimization
  const slottedItems = useMemo(
    () =>
      slotItemsMap.map(({ slotId, itemId }) => ({
        slotId,
        itemId,
        item: items.find(item => item.id === itemId)
      })),
    [items, slotItemsMap]
  );

  // Synchronize slotItemsMap with items prop when items change
  useEffect(() => {
    // Identify new items that aren't in slotItemsMap
    const newItems = items
      .filter(item => !slotItemsMap.some(slotItem => slotItem.itemId === item.id))
      .map(item => ({
        slotId: item.id,
        itemId: item.id
      }));

    // Remove items from slotItemsMap that no longer exist in items
    const updatedSlotItemsMap = slotItemsMap
      .filter(slotItem => items.some(item => item.id === slotItem.itemId) || slotItem.itemId === null)
      .concat(newItems);

    // Only update if there's a change to prevent unnecessary re-renders
    const isDifferent =
      updatedSlotItemsMap.length !== slotItemsMap.length ||
      updatedSlotItemsMap.some((slot, index) => slot.slotId !== slotItemsMap[index].slotId || slot.itemId !== slotItemsMap[index].itemId);

    if (isDifferent) {
      setSlotItemsMap(updatedSlotItemsMap);
      swapyRef.current?.setData({ array: updatedSlotItemsMap });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]); // Depend only on 'items' to avoid loop

  // Initialize Swapy and handle swaps
  useEffect(() => {
    const container = document.querySelector('.draggable-list-container');
    if (!container) return;

    swapyRef.current = createSwapy(container, {
      manualSwap: true
    });

    // Handle the swap event
    swapyRef.current.onSwap(({ data }) => {
      setSlotItemsMap(data.array);

      // Extract the new order of items and invoke the callback
      const newOrder = data.array
        .filter(slotItem => slotItem.itemId)
        .map(slotItem => items.find(item => item.id === slotItem.itemId)!)
        .filter((item): item is DraggableListItem => item !== undefined);

      const hasDuplicateIds = newOrder.some((item, index) => newOrder.findIndex(t => t.id === item.id) !== index);
      if (hasDuplicateIds) {
        console.error("Duplicate IDs in new order", newOrder);
      }else{
        onOrderChange(newOrder);
      }
    });

    // Cleanup on unmount
    return () => {
      swapyRef.current?.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Initialize only once

  return (
    <div className='draggable-list'>
      <div className="draggable-list-container">
        {slottedItems.map(({ slotId, itemId, item }) => (
          <div className="slot" data-swapy-slot={slotId} key={slotId}>
            {item ? (
              <div className="item flex items-center" data-swapy-item={itemId} key={itemId}>
                <div className="handle cursor-move" data-swapy-handle><GripVertical className='size-4'/></div>
                {item.reactElement}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DraggableList;
