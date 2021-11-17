odoo.define('pos_fel.pos_fel', function (require) {
"use strict";

var models = require('point_of_sale.models');
var screens = require('point_of_sale.screens');

var core = require('web.core');
var rpc = require('web.rpc');

var QWeb = core.qweb;

screens.ReceiptScreenWidget.include({
    render_receipt: function(){
        var order = this.pos.get_order();
        var self = this;

        rpc.query({
            model: 'pos.order',
            method: 'search_read',
            args: [[['pos_reference', '=', order.name]], ["firma_fel", "serie_fel", "numero_fel", "certificador_fel"]],
        }, {
            timeout: 5000,
        }).then(function (orders) {
            if (orders.length > 0) {
                var env = self.get_receipt_render_env();

                env['firma_fel'] = orders[0].firma_fel;
                env['serie_fel'] = orders[0].serie_fel;
                env['numero_fel'] = orders[0].numero_fel;
                env['certificador_fel'] = orders[0].certificador_fel;

                var precio_total_descuento = 0;
                var precio_total_positivo = 0;

                env['orderlines'].forEach(function(linea) {
                    if (linea.get_unit_price() > 0) {
                        precio_total_positivo += linea.get_price_with_tax();
                    } else if (linea.get_unit_price() < 0) {
                        precio_total_descuento += linea.get_price_with_tax();
                    }
                });
                
                env['precio_total_descuento'] = precio_total_descuento;

                var descuento_porcentaje_fel = precio_total_descuento / precio_total_positivo * -1;
                env['orderlines'].forEach(function(linea) {
                    if (linea.get_unit_price() > 0) {
                        linea.descuento_porcentaje_fel = descuento_porcentaje_fel * 100;
                        linea.descuento_nominal_fel = linea.get_price_with_tax() * descuento_porcentaje_fel;
                    } else if (linea.get_unit_price() < 0) {
                        linea.descuento_porcentaje_fel = 100;
                        linea.descuento_nominal_fel = linea.get_price_with_tax();
                    }
                });

                self.$('.pos-receipt-container').html(QWeb.render('OrderReceipt', env));
            }
        });
    }
})

});
