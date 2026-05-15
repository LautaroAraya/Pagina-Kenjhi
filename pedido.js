document.addEventListener('DOMContentLoaded', function () {
    // Agrega checkbox y, si corresponde, input de cantidad a cada item de menú y agregados
    document.querySelectorAll('.menu-section ul li').forEach(function (li) {
        li.classList.add('pedido-item');
        const textoOriginal = li.textContent.trim();
        const texto = textoOriginal.toUpperCase();
        li.textContent = '';
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'pedido-checkbox';
        checkbox.value = textoOriginal;
        checkbox.style.marginRight = '8px';

        const textoSpan = document.createElement('span');
        textoSpan.className = 'pedido-texto';
        textoSpan.textContent = textoOriginal;

        // Detectar aderezos de pollo kentucky
        const esAderezoDePollo = (
            texto.includes('MAYONESA COMUN') ||
            texto.includes('MAYONESA DE AJO') ||
            texto.includes('KETCHUP COMUN') ||
            texto.includes('KETCHUP PICANTE')
        );
        // No agregar contador a CHEDDAR, BACON, 2 PIZZETAS y aderezos de pollo kentucky
        if (
            !texto.includes('CHEDDAR.') &&
            !texto.includes('BACON.') &&
            !texto.includes('2 PIZZETAS.') &&
            !esAderezoDePollo
        ) {
            const cantidadWrap = document.createElement('span');
            cantidadWrap.className = 'cantidad-wrap';

            const btnMenos = document.createElement('button');
            btnMenos.type = 'button';
            btnMenos.className = 'cantidad-btn cantidad-btn-menos';
            btnMenos.textContent = '−';

            const cantidad = document.createElement('input');
            cantidad.type = 'number';
            cantidad.className = 'cantidad-input';
            cantidad.min = 0;
            cantidad.value = 0;

            const btnMas = document.createElement('button');
            btnMas.type = 'button';
            btnMas.className = 'cantidad-btn cantidad-btn-mas';
            btnMas.textContent = '+';

            const setCantidadState = (habilitado) => {
                cantidad.disabled = !habilitado;
                btnMenos.disabled = !habilitado;
                btnMas.disabled = !habilitado;
            };

            setCantidadState(false);

            checkbox.addEventListener('change', function () {
                setCantidadState(this.checked);
                if (!this.checked) {
                    cantidad.value = 0;
                } else if (parseInt(cantidad.value) < 1 || isNaN(cantidad.value)) {
                    cantidad.value = 1;
                    cantidad.focus();
                }
                actualizarTotal();
            });

            cantidadWrap.appendChild(btnMenos);
            cantidadWrap.appendChild(cantidad);
            cantidadWrap.appendChild(btnMas);
            li.prepend(cantidadWrap);
        }

        li.prepend(checkbox);
        li.appendChild(textoSpan);
    });

    document.addEventListener('click', function (e) {
        if (!e.target.classList.contains('cantidad-btn')) return;
        const li = e.target.closest('li');
        const cantidadInput = li ? li.querySelector('.cantidad-input') : null;
        const checkbox = li ? li.querySelector('.pedido-checkbox') : null;
        if (!cantidadInput) return;
        if (!checkbox || !checkbox.checked) {
            return;
        }

        const valorActual = parseInt(cantidadInput.value) || 0;
        if (e.target.classList.contains('cantidad-btn-mas')) {
            cantidadInput.value = valorActual + 1;
        }
        if (e.target.classList.contains('cantidad-btn-menos')) {
            cantidadInput.value = Math.max(0, valorActual - 1);
        }
        actualizarTotal();
    });

    // Validación de cantidad mínima
    document.querySelectorAll('.cantidad-input').forEach(input => {
        input.addEventListener('input', function () {
            if (parseInt(this.value) < 0 || isNaN(this.value)) this.value = 0;
        });
    });

    // Función para actualizar el total
    function actualizarTotal() {
        let total = 0;
        document.querySelectorAll('.pedido-checkbox:checked').forEach(cb => {
            const li = cb.parentElement;
            const precio = parseFloat(li.getAttribute('data-precio')) || 0;
            const cantidadInput = li.querySelector('.cantidad-input');
            let cantidad = 1;
            if (cantidadInput) cantidad = parseInt(cantidadInput.value) || 0;
            total += precio * cantidad;
        });
        const totalDiv = document.getElementById('total-pedido');
        if (totalDiv) totalDiv.innerText = 'Total: $' + total.toLocaleString();
        return total;
    }

    // Actualizar total al cambiar cantidades o selección
    document.addEventListener('input', function (e) {
        if (e.target.classList.contains('cantidad-input') || e.target.classList.contains('pedido-checkbox')) {
            actualizarTotal();
        }
    });
    document.addEventListener('change', function (e) {
        if (e.target.classList.contains('pedido-checkbox')) {
            actualizarTotal();
        }
    });

    // Mostrar/ocultar campo dirección según opción de envío
    const radiosEnvio = document.querySelectorAll('.envio-radio');
    const direccionContainer = document.getElementById('direccion-container');
    if (radiosEnvio.length && direccionContainer) {
        radiosEnvio.forEach(radio => {
            radio.addEventListener('change', function () {
                if (this.value === 'Para enviar') {
                    direccionContainer.style.display = 'block';
                } else {
                    direccionContainer.style.display = 'none';
                }
            });
        });
    }

    const pagoRadios = document.querySelectorAll('.pago-radio');
    const pagoCbuContainer = document.getElementById('pago-cbu-container');
    const pagoCombinadoContainer = document.getElementById('pago-combinado-container');
    const montoTransferenciaInput = document.getElementById('monto-transferencia');
    const montoEfectivoInput = document.getElementById('monto-efectivo');
    const cbuInput = document.getElementById('cbu-kenjhi');
    const btnCopiarCbu = document.getElementById('btn-copiar-cbu');

    function calcularTotalPedidoSeleccionado() {
        let total = 0;
        document.querySelectorAll('.pedido-checkbox:checked').forEach(cb => {
            const li = cb.parentElement;
            const precio = parseFloat(li.getAttribute('data-precio')) || 0;
            const cantidadInput = li.querySelector('.cantidad-input');
            let cantidad = 1;
            if (cantidadInput) cantidad = parseInt(cantidadInput.value) || 0;
            total += precio * cantidad;
        });
        return total;
    }

    function actualizarPagoCombinado(origen) {
        const pagoSeleccionado = document.querySelector('.pago-radio:checked');
        if (!pagoSeleccionado || pagoSeleccionado.value !== 'Combinado') return;

        const totalPedido = calcularTotalPedidoSeleccionado();
        const valorTransferencia = montoTransferenciaInput ? parseFloat(montoTransferenciaInput.value) || 0 : 0;
        const valorEfectivo = montoEfectivoInput ? parseFloat(montoEfectivoInput.value) || 0 : 0;

        if (origen === 'transferencia' && montoTransferenciaInput && montoEfectivoInput) {
            const restante = Math.max(totalPedido - valorTransferencia, 0);
            montoEfectivoInput.value = restante;
        }

        if (origen === 'efectivo' && montoTransferenciaInput && montoEfectivoInput) {
            const restante = Math.max(totalPedido - valorEfectivo, 0);
            montoTransferenciaInput.value = restante;
        }
    }

    function actualizarCamposPago() {
        const pagoSeleccionado = document.querySelector('.pago-radio:checked');
        const valorPago = pagoSeleccionado ? pagoSeleccionado.value : '';

        if (pagoCbuContainer) {
            pagoCbuContainer.style.display = (valorPago === 'Transferencia' || valorPago === 'Combinado') ? 'block' : 'none';
        }
        if (pagoCombinadoContainer) {
            pagoCombinadoContainer.style.display = valorPago === 'Combinado' ? 'block' : 'none';
        }
    }

    pagoRadios.forEach(radio => {
        radio.addEventListener('change', actualizarCamposPago);
    });

    if (montoTransferenciaInput) {
        montoTransferenciaInput.addEventListener('input', function () {
            actualizarPagoCombinado('transferencia');
        });
    }

    if (montoEfectivoInput) {
        montoEfectivoInput.addEventListener('input', function () {
            actualizarPagoCombinado('efectivo');
        });
    }

    actualizarCamposPago();

    if (btnCopiarCbu && cbuInput) {
        btnCopiarCbu.addEventListener('click', async function () {
            const textoCbu = cbuInput.value.trim();
            try {
                await navigator.clipboard.writeText(textoCbu);
                const textoOriginal = btnCopiarCbu.textContent;
                btnCopiarCbu.textContent = 'Copiado';
                setTimeout(() => {
                    btnCopiarCbu.textContent = textoOriginal;
                }, 1500);
            } catch (error) {
                cbuInput.focus();
                cbuInput.select();
                document.execCommand('copy');
            }
        });
    }

    // Modal de previsualización
    const wspBtn = document.getElementById('wsp-float');
    const modal = document.getElementById('modal-preview');
    const previewContent = document.getElementById('preview-content');
    const btnEnviar = document.getElementById('btn-enviar-wsp');
    const btnCerrar = document.getElementById('btn-cerrar-preview');
    const btnLimpiar = document.getElementById('limpiar-pedido');

    let mensajeFinal = '';

    wspBtn.addEventListener('click', function (e) {
        e.preventDefault();

        // Artículos seleccionados con cantidad y precio
        const seleccionados = Array.from(document.querySelectorAll('.pedido-checkbox:checked'))
            .map(cb => {
                const li = cb.parentElement;
                const precio = parseFloat(li.getAttribute('data-precio')) || 0;
                const cantidadInput = li.querySelector('.cantidad-input');
                let cantidad = 1;
                if (cantidadInput) cantidad = parseInt(cantidadInput.value) || 0;
                return {
                    texto: cb.value,
                    cantidad: cantidad,
                    precio: precio,
                    subtotal: precio * cantidad,
                    esAderezoPollo: (
                        cb.value.toUpperCase().includes('MAYONESA COMUN') ||
                        cb.value.toUpperCase().includes('MAYONESA DE AJO') ||
                        cb.value.toUpperCase().includes('KETCHUP COMUN') ||
                        cb.value.toUpperCase().includes('KETCHUP PICANTE')
                    )
                };
            });

        // Separar aderezos de pollo kentucky
        const aderezosPollo = seleccionados.filter(item => item.esAderezoPollo);
        const productosSeleccionados = seleccionados.filter(item => !item.esAderezoPollo);

        // Validar que todos los productos seleccionados tengan cantidad mayor a 0
        const algunoSinCantidad = productosSeleccionados.some(item => item.cantidad < 1 || isNaN(item.cantidad));
        if (algunoSinCantidad) {
            alert('Ingresá la cantidad para cada producto seleccionado (debe ser al menos 1).');
            return;
        }

        // ...la validación ya se realiza con productosSeleccionados más arriba...

        // Método de pago seleccionado
        const pagoSeleccionado = document.querySelector('.pago-radio:checked');
        const metodoPago = pagoSeleccionado ? pagoSeleccionado.value : '';
        const montoTransferencia = montoTransferenciaInput ? parseFloat(montoTransferenciaInput.value) || 0 : 0;
        const montoEfectivo = montoEfectivoInput ? parseFloat(montoEfectivoInput.value) || 0 : 0;

        // Forma de envío seleccionada
        const envio = document.querySelector('.envio-radio:checked');
        const direccion = document.getElementById('direccion-envio') ? document.getElementById('direccion-envio').value.trim() : '';
        const nombrePedido = document.getElementById('nombre-pedido') ? document.getElementById('nombre-pedido').value.trim() : '';
        const alergiaPedido = document.getElementById('alergia-pedido') ? document.getElementById('alergia-pedido').value.trim() : '';
        const observacionesPedido = document.getElementById('observaciones-pedido') ? document.getElementById('observaciones-pedido').value.trim() : '';

        const horarioPedido = document.getElementById('horario-pedido') ? document.getElementById('horario-pedido').value.trim() : '';


        // Validaciones
        if (seleccionados.length === 0) {
            alert('Seleccioná al menos un producto para pedir por WhatsApp.');
            return;
        }
        if (!metodoPago) {
            alert('Seleccioná una forma de pago.');
            return;
        }
        if (!envio) {
            alert('Seleccioná si lo pasás a buscar o es para enviar.');
            return;
        }
        if (envio.value === 'Para enviar' && direccion === '') {
            alert('Ingresá la dirección de envío.');
            document.getElementById('direccion-envio').focus();
            return;
        }
        if (nombrePedido === '') {
            alert('Ingresá el nombre de quien recibe el pedido.');
            document.getElementById('nombre-pedido').focus();
            return;
        }
        if (horarioPedido === '') {
            alert('Ingresá el horario de retiro/envío.');
            document.getElementById('horario-pedido').focus();
            return;
        }
        if (metodoPago === 'Combinado' && (montoTransferencia <= 0 || montoEfectivo <= 0)) {
            alert('Completá cuánto transfiere y cuánto paga en efectivo.');
            return;
        }

        // Calcular total
        const total = seleccionados.reduce((acc, item) => acc + item.subtotal, 0);

        // Armar mensaje
        const productosTexto = productosSeleccionados.map(item =>
            `- ${item.texto} x${item.cantidad} ($${item.precio.toLocaleString()} c/u) = $${item.subtotal.toLocaleString()}`
        ).join('\n');
        mensajeFinal = `Quisiera pedir esto:\n${productosTexto}`;
        if (aderezosPollo.length > 0) {
            mensajeFinal += `\n\nAderezos para Pollo Kentucky: ` + aderezosPollo.map(a => a.texto).join(', ');
        }
        mensajeFinal += `\n\nForma de pago: ${metodoPago}`;
        if (metodoPago === 'Transferencia') {
            mensajeFinal += `\nMonto a transferir: $${total.toLocaleString()}`;
        }
        if (metodoPago === 'Combinado') {
            const totalCombinado = montoTransferencia + montoEfectivo;
            mensajeFinal += `\nPago combinado:`;
            mensajeFinal += `\nMonto a transferir: $${montoTransferencia.toLocaleString()}`;
            mensajeFinal += `\nMonto en efectivo: $${montoEfectivo.toLocaleString()}`;
            mensajeFinal += `\nTotal pago combinado: $${totalCombinado.toLocaleString()}`;
        }
        mensajeFinal += `\n\nEntrega: ${envio.value}`;
        if (envio.value === 'Para enviar') {
            mensajeFinal += `\nDirección: ${direccion}`;
        }
        mensajeFinal += `\n\nNombre: ${nombrePedido}`;
        //agregar el horario del pedido
        if (horarioPedido) {
            mensajeFinal += `\n\nHorario: ${horarioPedido}`;
        }
        if (alergiaPedido) {
            mensajeFinal += `\n\nAlergia alimentaria: ${alergiaPedido}`;
        }
        if (observacionesPedido) {
            mensajeFinal += `\n\nObservaciones: ${observacionesPedido}`;
        }
        mensajeFinal += `\n\nTOTAL: $${total.toLocaleString()}`;

        // Mostrar previsualización
        previewContent.innerText = mensajeFinal;
        modal.style.display = 'flex';
    });

    btnCerrar.addEventListener('click', function () {
        modal.style.display = 'none';
    });

    btnEnviar.addEventListener('click', function () {
        const wspURL = `https://wa.me/3498432943?text=${encodeURIComponent(mensajeFinal)}`;
        window.open(wspURL, '_blank');
        modal.style.display = 'none';
        setTimeout(() => {
            alert('¡Gracias por tu pedido! Te responderemos a la brevedad.');
        }, 500);
    });

    if (btnLimpiar) {
        btnLimpiar.addEventListener('click', function () {
            document.querySelectorAll('.pedido-checkbox').forEach(cb => {
                cb.checked = false;
            });
            document.querySelectorAll('.cantidad-input').forEach(input => {
                input.value = 0;
            });
            document.querySelectorAll('.pago-radio').forEach(cb => {
                cb.checked = false;
            });
            if (montoTransferenciaInput) montoTransferenciaInput.value = '';
            if (montoEfectivoInput) montoEfectivoInput.value = '';
            actualizarCamposPago();
            document.querySelectorAll('.envio-radio').forEach(radio => {
                radio.checked = false;
            });
            const direccionInput = document.getElementById('direccion-envio');
            const nombreInput = document.getElementById('nombre-pedido');
            const horarioInput = document.getElementById('horario-pedido');
            const alergiaInput = document.getElementById('alergia-pedido');
            const observacionesInput = document.getElementById('observaciones-pedido');
            if (direccionInput) direccionInput.value = '';
            if (nombreInput) nombreInput.value = '';
            if (horarioInput) horarioInput.value = '';
            if (alergiaInput) alergiaInput.value = '';
            if (observacionesInput) observacionesInput.value = '';
            if (direccionContainer) direccionContainer.style.display = 'none';
            mensajeFinal = '';
            previewContent.innerText = '';
            modal.style.display = 'none';
            actualizarTotal();
        });
    }

    // Cerrar modal al hacer click fuera del cuadro
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
});

window.addEventListener('DOMContentLoaded', function () {
    const bienvenida = document.getElementById('kenjhi-bienvenida');
    const bienvenidaBtn = document.getElementById('kenjhi-bienvenida-btn');
    if (bienvenida && bienvenidaBtn) {
        bienvenida.style.display = 'flex';
        bienvenidaBtn.onclick = function() {
            bienvenida.style.display = 'none';
        };
    }
});