"use client";
import React, {
  useEffect,
  useLayoutEffect,
  useState,
  useRef,
} from "react";
import { GripVertical } from "lucide-react";
import { createSwapy, SlotItemMap, Swapy } from "swapy";

// Define the shape of each item
interface DraggableListItem {
  id: string;
  reactElement: React.ReactElement;
}

// Define the props for DraggableList
interface DraggableListProps {
  containerId: string;
  items: DraggableListItem[];
  onOrderChange: (newOrder: DraggableListItem[]) => void;
}

const DraggableList: React.FC<DraggableListProps> = ({
  containerId,
  items,
  onOrderChange,
}) => {
  const swapyRef = useRef<Swapy | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);

  // Initialize slotItemsMap based on items prop
  const [slotItemsMap, setSlotItemsMap] = useState<SlotItemMap>(() => [
    ...items.map((item, index) => ({
      slotId: index.toString(),
      itemId: item.id,
    })),
  ]);

  const slottedItems = slotItemsMap.map(({ slotId, itemId }, index) => ({
    slotId,
    itemId,
    item: items.find((item) => item.id === itemId),
  }));

  // Synchronize slotItemsMap with items prop when items change
  useEffect(() => {
    try {
      console.log("dragable-list: got new items", items);
      // Identify new items that aren't in slotItemsMap
      const newItems = items
        .map((item, index) => ({
          slotId: index.toString(),
          itemId: item.id,
        }));

        setSlotItemsMap(newItems);
        swapyRef.current?.setData({ array: newItems });
    } catch (e) {
      console.error("Error in DraggableList", e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]); 

  // Initialize Swapy
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) {
      console.warn("Container not found for ", containerId);
      return;
    }

    try {
      swapyRef.current = createSwapy(container, {
        // manualSwap: true,
        swapMode: "drop",
      });
      console.log("created swapy instance for ", containerId);
    } catch (error) {
      console.error("Error in DraggableList", error);
    }

    // Cleanup on unmount
    return () => {
      swapyRef.current?.destroy();
    };
  }, []);
  //handle swaps
  useLayoutEffect(() => {
    try {
      const container = containerRef.current;
      if (!swapyRef.current) {
        console.warn("Swapy instance not found for ", containerId);
        return;
      }

      // Handle the swap event
      swapyRef.current.onSwapEnd(({ data }) => {
        try {
          setSlotItemsMap(data.array);

          // Extract the new order of items and invoke the callback
          const newOrder = data.array
            .filter((slotItem) => slotItem.itemId)
            .map(
              (slotItem) => items.find((item) => item.id === slotItem.itemId)!
            )
            .filter((item): item is DraggableListItem => item !== undefined);

          const hasDuplicateIds = newOrder.some(
            (item, index) =>
              newOrder.findIndex((t) => t.id === item.id) !== index
          );
          if (hasDuplicateIds) {
            console.error("Duplicate IDs in new order", newOrder);
          } else {
            onOrderChange(newOrder);
          }
        } catch (e) {
          console.error("Error in DraggableList", e);
        }
      });
    } catch (e) {
      console.error("Error in DraggableList", e);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Initialize only once

  return (
    <div className="draggable-list">
      <div ref={containerRef}>
        {slottedItems.length === 0 && (
          <div className="slot" data-swapy-slot="empty-slot">
            <div data-swapy-item="empty-slot" />
          </div>
        )}
        {slottedItems.map(({ slotId, itemId, item }) => (
          <div className="slot" data-swapy-slot={slotId} key={slotId}>
            {item ? (
              <div
                className="item flex items-center"
                data-swapy-item={itemId}
                key={itemId}
              >
                <div className="handle cursor-move" data-swapy-handle>
                  <GripVertical className="size-4" />
                </div>
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
