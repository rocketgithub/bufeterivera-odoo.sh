# -*- encoding: utf-8 -*-

from odoo import models, fields, api, _
import logging

class PosOrder(models.Model):
    _inherit = 'pos.order'

    firma_fel = fields.Char('Firma FEL', related='invoice_id.firma_fel')
    serie_fel = fields.Char('Serie FEL', related='invoice_id.serie_fel')
    numero_fel = fields.Char('Numero FEL', related='invoice_id.numero_fel')
    
    def _prepare_invoice_line(self, order_line):
        res = super(PosOrder, self)._prepare_invoice_line(order_line)
        if order_line.pack_lot_ids:
            lotes = ', '.join([l.lot_name for l in order_line.pack_lot_ids if l.lot_name])
            res['name'] += ': '+lotes
        return res

    def _prepare_invoice_vals(self):
        res = super(PosOrder, self)._prepare_invoice_vals()
        if self.pedido_origen_id and self.pedido_origen_id.invoice_id:
            res['factura_original_id'] = self.pedido_origen_id.invoice_id.id
            res['motivo_fel'] = 'Anulación'
        logging.warn(res)
        return res

