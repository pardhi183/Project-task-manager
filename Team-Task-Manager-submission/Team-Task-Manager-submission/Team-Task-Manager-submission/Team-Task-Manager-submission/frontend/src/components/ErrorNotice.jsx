const ErrorNotice = ({ error }) => {
  if (!error) return null;

  return (
    <div className="notice error" role="alert">
      <strong>{error.message || error}</strong>
      {error.errors?.length > 0 && (
        <ul>
          {error.errors.map((item) => (
            <li key={`${item.field}-${item.message}`}>{item.field}: {item.message}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ErrorNotice;
