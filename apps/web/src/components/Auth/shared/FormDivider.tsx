interface FormDividerProps {
  text: string;
}

export function FormDivider({ text }: FormDividerProps) {
  return (
    <div className='mt-8'>
      <div className='relative'>
        <div className='absolute inset-0 flex items-center'>
          <div className='w-full border-t border-border' />
        </div>
        <div className='relative flex justify-center text-sm'>
          <span className='px-4 bg-card text-muted-foreground'>{text}</span>
        </div>
      </div>
    </div>
  );
}
