import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

interface LowStockItem {
  medicamentoNome: string;
  quantidadeDisponivel: number;
  estoqueMinimo: number;
}

interface NotificationBellProps {
  notifications: LowStockItem[];
}

const NotificationBell: React.FC<NotificationBellProps> = ({
  notifications,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const hasNotifications = notifications.length > 0;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative focus:outline-none p-2 rounded-full hover:bg-blue-100"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z"
            stroke="#2563EB"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 22.0001 12 22C11.6496 22.0001 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21"
            stroke="#2563EB"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {}
        {hasNotifications && (
          <span className="absolute top-1 right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
        )}
      </button>

      {}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border z-10 animate-fade-in-down">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-gray-800">
              Notificações de Estoque Baixo
            </h3>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {hasNotifications ? (
              notifications.map((item, index) => (
                <Link
                  to="/controle-estoque"
                  onClick={() => setIsOpen(false)}
                  key={index}
                  className="block p-4 hover:bg-gray-50 border-b"
                >
                  <p className="font-bold text-red-600">
                    Alerta: {item.medicamentoNome}
                  </p>
                  <p className="text-xs text-gray-600">
                    Estoque Atual: {item.quantidadeDisponivel} (Mínimo:{" "}
                    {item.estoqueMinimo})
                  </p>
                </Link>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500 text-sm">
                Nenhuma notificação.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
