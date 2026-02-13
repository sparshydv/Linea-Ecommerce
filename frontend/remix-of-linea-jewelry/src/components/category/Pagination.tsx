import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination = ({ page, totalPages, onPageChange }: PaginationProps) => {
  if (totalPages <= 1) return null;

  const goPrev = () => onPageChange(Math.max(page - 1, 1));
  const goNext = () => onPageChange(Math.min(page + 1, totalPages));

  return (
    <section className="w-full px-6 py-8">
      <div className="flex justify-start items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="p-2 hover:bg-transparent hover:opacity-50 disabled:opacity-30 -ml-2"
          disabled={page === 1}
          onClick={goPrev}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="min-w-8 h-8 hover:bg-transparent underline font-normal text-sm"
          >
            {page}
          </Button>
          <span className="text-sm font-light text-muted-foreground">of {totalPages}</span>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="p-2 hover:bg-transparent hover:opacity-50"
          disabled={page === totalPages}
          onClick={goNext}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </section>
  );
};

export default Pagination;