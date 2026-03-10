import { Edit, Eye, MoreVertical, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '../ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';

export interface AdminTableColumn {
  header: string;
  accessor: string;
  render?: (value: any, row: any) => React.ReactNode;
}

interface AdminTableProps {
  columns: AdminTableColumn[];
  data: any[];
  onDelete?: (row: any) => void;
  onEdit?: (row: any) => void;
  onView?: (row: any) => void;
  loading?: boolean;
}

export const AdminTable = ({
  columns,
  data,
  onDelete,
  onEdit,
  onView,
  loading = false,
}: AdminTableProps) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex justify-center items-center h-96">
        <p className="text-gray-500 text-lg">Aucune donnée trouvée</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm bg-white">
      <Table>
        <TableHeader>
          <TableRow className="bg-white border-b border-gray-200">
            {columns.map((column) => (
              <TableHead key={column.accessor} className="font-semibold text-gray-900 py-4 text-left">
                {column.header}
              </TableHead>
            ))}
            {(onDelete || onEdit || onView) && <TableHead className="text-right font-semibold text-gray-900 py-4">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, rowIndex) => (
            <TableRow key={rowIndex} className="hover:bg-gray-50 transition-colors duration-150 border-b border-gray-100 last:border-0">
              {columns.map((column) => (
                <TableCell key={`${rowIndex}-${column.accessor}`} className="text-gray-900 py-4 text-left">
                  {column.render
                    ? column.render(row[column.accessor], row)
                    : String(row[column.accessor] || '-')}
                </TableCell>
              ))}
              {(onDelete || onEdit || onView) && (
                <TableCell className="text-right py-4">
                  <div className="flex items-center justify-end gap-2">
                    {onView && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onView(row)}
                        className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                      >
                        <Eye size={18} />
                      </Button>
                    )}
                    {onEdit && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(row)}
                        className="text-blue-600 hover:bg-blue-100 hover:text-blue-700 transition-colors"
                      >
                        <Edit size={18} />
                      </Button>
                    )}
                    {(onDelete || onEdit || onView) && !onDelete && !onEdit && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-gray-600 hover:bg-gray-100">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {onView && (
                            <DropdownMenuItem onClick={() => onView(row)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Voir les détails
                            </DropdownMenuItem>
                          )}
                          {onEdit && (
                            <DropdownMenuItem onClick={() => onEdit(row)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Éditer
                            </DropdownMenuItem>
                          )}
                          {onDelete && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => onDelete(row)}
                                className="text-rose-600 cursor-pointer"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Supprimer
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                    {onDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(row)}
                        className="text-rose-600 hover:bg-rose-100 hover:text-rose-700 transition-colors"
                      >
                        <Trash2 size={18} />
                      </Button>
                    )}
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
