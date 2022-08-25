let cliente = {
    
    mesa: '',
    hora: '',
    pedido: []
};
const categorias = {
    1: 'Comida',
    2: 'Bebidas',
    3: 'Postres'
}

const guardarCliente = document.querySelector('#guardar-cliente');

guardarCliente.addEventListener('click', validarGuardarCliente);

function validarGuardarCliente() {
    
    const mesa = document.querySelector('#mesa').value;
    const hora = document.querySelector('#hora').value;

    const campoVacio = [ mesa, hora ].some(campo => campo === '');

    if (campoVacio) {

        const existeAlerta = document.querySelector('.invalid-feedback');

        if (!existeAlerta) {
            
        
        const alerta = document.createElement('div');
        alerta.classList.add('invalid-feedback', 'd-block', 'text-center');
        alerta.textContent = 'Todos los campos son obligatorios';
        document.querySelector('.modal-body form').appendChild(alerta);

        setTimeout(() => {
            alerta.remove();
        }, 3000);
    }
    } else {
        
        cliente = { ...cliente, mesa, hora};

        const modalForm = document.querySelector('#formulario');
        const bootstrapModal = bootstrap.Modal.getInstance(modalForm);
        bootstrapModal.hide();

        mostrarSecciones();
        cargarPlatos();
        
    }
}

function mostrarSecciones() {
    const secciones = document.querySelectorAll('.d-none');
    secciones.forEach(seccion => seccion.classList.remove('d-none'));
}
function cargarPlatos() {
    const url = 'http://localhost:4000/platillos';

    fetch(url)
        .then(respuesta => respuesta.json())
        .then(platos =>  mostrarPlatos(platos))
        .catch(error => console.log(error))
    }
function mostrarPlatos(platos) {
    
    const contenido = document.querySelector('#platillos .contenido');

    platos.forEach(plato => {
        
     const { precio, nombre, id, categoria} = plato;

    const divProd = document.createElement('div');
    divProd.classList.add('row', 'py-3', 'border-top');

    const nombreDiv = document.createElement('div');
    nombreDiv.classList.add('col-md-4');

    const precioDiv = document.createElement('div');
    precioDiv.classList.add('col-md-3', 'fw-bold');

    const categoriaDiv = document.createElement('div');
    categoriaDiv.classList.add('col-md-3');
    
    nombreDiv.textContent = nombre;
    precioDiv.textContent = `$ ${precio}`;
    categoriaDiv.textContent = categorias[categoria];

    const cantidadInput = document.createElement('input');
    cantidadInput.type = 'number';
    cantidadInput.value = 0;
    cantidadInput.min = 0;
    cantidadInput.id = `producto-${id}`;
    cantidadInput.classList.add('form-control');

    cantidadInput.onchange = function () {
        const cantidad = parseInt(cantidadInput.value);
        agregarPlato({...plato, cantidad});
    }

    const agregarCantidadDiv = document.createElement('div');
    agregarCantidadDiv.classList.add('col-md-2');

    agregarCantidadDiv.appendChild(cantidadInput);

    divProd.appendChild(nombreDiv);
    divProd.appendChild(precioDiv);
    divProd.appendChild(categoriaDiv);
    divProd.appendChild(agregarCantidadDiv);

    contenido.appendChild(divProd);
    
    })
}

function agregarPlato(producto) {
    
    let {pedido} = cliente;
    if (producto.cantidad > 0) {
        if((pedido.some(articulo => articulo.id === producto.id))){ 

        const pedidoActualizado = pedido.map(articulo => {
            if (articulo.id === producto.id) {
                articulo.cantidad = producto.cantidad;
            }
            return articulo;
        });
        cliente.pedido = [...pedidoActualizado];
    }  else {
        cliente.pedido = [...pedido, producto];
    }
    } else {
        console.log('la cantidad es menor a 0');
        const resultado = pedido.filter(articulo => articulo.id !== producto.id);
        cliente.pedido = [...resultado];
    }

    limpiarHTML();

    if (cliente.pedido.length) {
        actualizarResumen();
        propina();
    } else {
        mensajePedidoVacio();
    }
    
   
}

function actualizarResumen() {

    const contenido = document.querySelector('#resumen .contenido');
    
    const resumen = document.createElement('div');
    resumen.classList.add('col-md-6', 'card', 'py-2', 'px-3', 'shadow');

    const mesa = document.createElement('p');
    mesa.classList.add('fw-bold');
    mesa.textContent = 'Mesa: ';

    const mesaSpan = document.createElement('span');
    mesaSpan.classList.add('fw-normal');
    mesaSpan.textContent = cliente.mesa;

    const hora = document.createElement('p');
    hora.classList.add('fw-bold');
    hora.textContent = 'Hora: ';

    const horaSpan = document.createElement('span');
    horaSpan.classList.add('fw-normal');
    horaSpan.textContent = cliente.hora;

    const heading = document.createElement('h3');
    heading.classList.add('my-4', 'text-center');
    heading.textContent = 'Platos consumidos ';

    const grupo = document.createElement('ul');
    grupo.classList.add('list-group');

    const {pedido} = cliente;
    pedido.forEach(pedido => {
        const {nombre, cantidad, precio, id} = pedido;

        const lista = document.createElement('li');
        lista.classList.add('list-group-item');

        const nombreH4 = document.createElement('h4');
        nombreH4.classList.add('my-4');
        nombreH4.textContent = nombre;

        const cantidadP = document.createElement('p');
        cantidadP.classList.add('fw-bold');
        cantidadP.textContent = 'Cantidad: ';
    
        const cantidadSpan = document.createElement('span');
        cantidadSpan.classList.add('fw-normal');
        cantidadSpan.textContent = cantidad;

        const precioP = document.createElement('p');
        precioP.classList.add('fw-bold');
        precioP.textContent = 'Precio: ';
    
        const precioSpan = document.createElement('span');
        precioSpan.classList.add('fw-normal');
        precioSpan.textContent = `$${precio}`;

        const subtotalP = document.createElement('p');
        subtotalP.classList.add('fw-bold');
        subtotalP.textContent = 'Subtotal: ';
    
        const subtotalSpan = document.createElement('span');
        subtotalSpan.classList.add('fw-normal');
        subtotalSpan.textContent = calcularSubtotal(precio,cantidad);

        cantidadP.appendChild(cantidadSpan);
        precioP.appendChild(precioSpan);
        subtotalP.appendChild(subtotalSpan);

        const eliminarBtn = document.createElement('button');
        eliminarBtn.classList.add('btn', 'btn-danger');
        eliminarBtn.textContent = 'Eliminar del pedido';

        eliminarBtn.onclick = function() {
            eliminarPedido(id);
        }

        lista.appendChild(nombreH4);
        lista.appendChild(cantidadP);
        lista.appendChild(precioP);
        lista.appendChild(subtotalP);
        lista.appendChild(eliminarBtn);


        grupo.appendChild(lista);
    });

    mesa.appendChild(mesaSpan);
    hora.appendChild(horaSpan);

    resumen.appendChild(heading);
    resumen.appendChild(mesa);
    resumen.appendChild(hora);   
    resumen.appendChild(grupo);

    contenido.appendChild(resumen);
}

function limpiarHTML() {
    const contenido = document.querySelector('#resumen .contenido');

    while (contenido.firstChild) {
        contenido.removeChild(contenido.firstChild);
    }
    
}

function calcularSubtotal(precio,cantidad) {
    return `$ ${precio * cantidad} `;
}

function eliminarPedido(id) {

    const {pedido} = cliente;

    const resultado = pedido.filter(articulo => articulo.id !== id);
    cliente.pedido = [...resultado];

    limpiarHTML();
    
    if (cliente.pedido.length) {
        actualizarResumen();
        propina();
    } else {
        mensajePedidoVacio();
    }

    const prodEliminado = `#producto-${id}`;
    const prodEliminadoInput = document.querySelector(prodEliminado);
    prodEliminadoInput.value = 0; 
}

function mensajePedidoVacio() {
    
    const contenido = document.querySelector('#resumen .contenido');

    const mensaje = document.createElement('p');
    mensaje.classList.add('text-center');
    mensaje.textContent= 'Añade los elementos del pedido';

    contenido.appendChild(mensaje);
}

function propina() {
    
    const contenido = document.querySelector('#resumen .contenido');
    const formulario = document.createElement('div');
    formulario.classList.add('col-md-6', 'formulario');

    const formularioDiv = document.createElement('div');
    formularioDiv.classList.add('card', 'py-2', 'px-3', 'shadow');

    const heading = document.createElement('h3');
    heading.classList.add('my-4', 'text-center');
    heading.textContent = 'Propinas';

    const radio10 = document.createElement('input');
    radio10.type = 'radio';
    radio10.name = 'propina';
    radio10.value= '10';
    radio10.classList.add('form-check-input');
    radio10.onclick = calcularPropina;

    const radio10Label = document.createElement('label');
    radio10Label.textContent = '10%';
    radio10Label.classList.add('form-check-label');

    const radio10Div = document.createElement('div');
    radio10Div.classList.add('form-check');


    radio10Div.appendChild(radio10);
    radio10Div.appendChild(radio10Label);

    const radio25 = document.createElement('input');
    radio25.type = 'radio';
    radio25.name = 'propina';
    radio25.value= '25';
    radio25.classList.add('form-check-input');
    radio25.onclick = calcularPropina;

    const radio25Label = document.createElement('label');
    radio25Label.textContent = '25%';
    radio25Label.classList.add('form-check-label');

    const radio25Div = document.createElement('div');
    radio25Div.classList.add('form-check');

    radio25Div.appendChild(radio25);
    radio25Div.appendChild(radio25Label);

    const radio50 = document.createElement('input');
    radio50.type = 'radio';
    radio50.name = 'propina';
    radio50.value= '50';
    radio50.classList.add('form-check-input');
    radio50.onclick = calcularPropina;

    const radio50Label = document.createElement('label');
    radio50Label.textContent = '50%';
    radio50Label.classList.add('form-check-label');

    const radio50Div = document.createElement('div');
    radio50Div.classList.add('form-check');

    radio50Div.appendChild(radio50);
    radio50Div.appendChild(radio50Label);

    formularioDiv.appendChild(heading);
    formularioDiv.appendChild(radio10Div);
    formularioDiv.appendChild(radio25Div);
    formularioDiv.appendChild(radio50Div);

    formulario.appendChild(formularioDiv);

    contenido.appendChild(formulario);
    
}

function calcularPropina() {
    
    const {pedido} = cliente;
    let subtotal = 0;

    pedido.forEach(articulo => {
        subtotal += articulo.cantidad * articulo.precio;
    });
    
    const propinaSeleccionada = document.querySelector('[name="propina"]:checked').value;
    const propina = ((subtotal * parseInt(propinaSeleccionada)) / 100);

    const total = subtotal + propina;

    mostrarTotalHTML(subtotal, propina, total);
}

function mostrarTotalHTML(subtotal, propina, total) {

    const divTotales = document.createElement('div');
    divTotales.classList.add('total-pagar', 'my-5');

    const subtotalP = document.createElement('p');
    subtotalP.classList.add('fs-4', 'fw-bold', 'mt-2');
    subtotalP.textContent = 'Subtotal: ';

    const subtotalSpan = document.createElement('span');
    subtotalSpan.classList.add('fw-normal');
    subtotalSpan.textContent = `$${subtotal}`;

    subtotalP.appendChild(subtotalSpan);

    const propinaP = document.createElement('p');
    propinaP.classList.add('fs-4', 'fw-bold', 'mt-2');
    propinaP.textContent = 'Propina: ';

    const propinaSpan = document.createElement('span');
    propinaSpan.classList.add('fw-normal');
    propinaSpan.textContent = `$${propina}`;

    propinaP.appendChild(propinaSpan);

    const totalP = document.createElement('p');
    totalP.classList.add('fs-4', 'fw-bold', 'mt-2');
    totalP.textContent = 'Total a pagar: ';

    const totalSpan = document.createElement('span');
    totalSpan.classList.add('fw-normal');
    totalSpan.textContent = `$${total}`;

    totalP.appendChild(totalSpan);

    const existeTotalPagar = document.querySelector('.total-pagar');

    if (existeTotalPagar) {
        existeTotalPagar.remove();
    }

    divTotales.appendChild(subtotalP);
    divTotales.appendChild(propinaP);
    divTotales.appendChild(totalP);

    // primer div adentro del formulario
    const formulario = document.querySelector('.formulario > div');
    formulario.appendChild(divTotales);

}