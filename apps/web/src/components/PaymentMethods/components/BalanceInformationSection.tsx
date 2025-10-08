// Balance Information Section Component
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface BalanceInformationSectionProps {
  formData: {
    current_balance?: number;
    available_balance?: number;
  };
  needsCreditDetails: boolean;
  setField: (field: string, value: string | number | boolean) => void;
  getFieldError: (field: string) => string | undefined;
}

export function BalanceInformationSection({
  formData,
  needsCreditDetails,
  setField,
  getFieldError,
}: BalanceInformationSectionProps) {
  return (
    <div className='space-y-4 border-t pt-4'>
      <h3 className='font-medium text-lg'>Información de Balance</h3>

      {/* Current Balance */}
      <div className='space-y-2'>
        <Label htmlFor='current_balance'>
          Balance Actual
          {needsCreditDetails && (
            <span className='text-xs text-gray-500 ml-2'>
              (negativo para tarjetas de crédito)
            </span>
          )}
        </Label>
        <Input
          id='current_balance'
          type='number'
          step='0.01'
          placeholder='0.00'
          value={formData.current_balance || ''}
          onChange={e =>
            setField('current_balance', parseFloat(e.target.value))
          }
          className={getFieldError('current_balance') ? 'border-red-500' : ''}
        />
        {getFieldError('current_balance') && (
          <p className='text-sm text-red-500'>
            {getFieldError('current_balance')}
          </p>
        )}
      </div>

      {/* Available Balance */}
      {!needsCreditDetails && (
        <div className='space-y-2'>
          <Label htmlFor='available_balance'>Balance Disponible</Label>
          <Input
            id='available_balance'
            type='number'
            step='0.01'
            min='0'
            placeholder='0.00'
            value={formData.available_balance || ''}
            onChange={e =>
              setField('available_balance', parseFloat(e.target.value))
            }
            className={
              getFieldError('available_balance') ? 'border-red-500' : ''
            }
          />
          {getFieldError('available_balance') && (
            <p className='text-sm text-red-500'>
              {getFieldError('available_balance')}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
