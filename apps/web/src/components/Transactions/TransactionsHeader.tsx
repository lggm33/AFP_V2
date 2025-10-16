// Transactions Header Component
interface TransactionsSummary {
  totalIncome: number;
  totalExpenses: number;
  netAmount: number;
  transactionCount: number;
}

interface TransactionsHeaderProps {
  summary?: TransactionsSummary | null;
  onCreate: () => void;
}

export function TransactionsHeader({
  summary,
  onCreate,
}: TransactionsHeaderProps) {
  return (
    <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
      <div className='text-center sm:text-left'>
        <h2 className='text-2xl font-bold text-foreground'>
          Tus Transacciones
        </h2>
        <p className='text-muted-foreground mt-1'>
          {summary
            ? `${summary.transactionCount} transacciones`
            : 'Gestiona tus transacciones financieras'}
          {summary &&
            ` • Balance neto: $${summary.netAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
        </p>
      </div>
      <button
        onClick={onCreate}
        className='bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3 w-full sm:w-auto'
      >
        + Agregar Transacción
      </button>
    </div>
  );
}
