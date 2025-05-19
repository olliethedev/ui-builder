import { Form } from "@/components/ui/form";
import ClassNameAdvancedField from "@/components/ui/ui-builder/internal/classname-advanced-field";

export default function ExampleComponentPage() {
  return (
    <div className="max-w-sm">
    <ClassNameAdvancedField value="w-full h-full flex flex-col justify-center items-center md:w-1/5 lg:w-full bg-red-500 px-2 border-2 border-gray-200 rounded-md" />
    </div>
  );
}
