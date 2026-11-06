const CONTROLS: readonly [string, string][] = [
  ['W A S D', 'Movimentar'],
  ['Shift', 'Correr'],
  ['Espaço', 'Passe curto'],
  ['K', 'Passe em profundidade'],
  ['L', 'Passe longo'],
  ['J', 'Finalizar'],
  ['E', 'Desarme (segure para pressionar)'],
  ['Q', 'Trocar jogador'],
  ['Esc', 'Pausar'],
];

export function ControlsHelp() {
  return (
    <ul className="controls" aria-label="Controles">
      {CONTROLS.map(([keys, label]) => (
        <li key={keys}>
          <kbd>{keys}</kbd> {label}
        </li>
      ))}
    </ul>
  );
}
