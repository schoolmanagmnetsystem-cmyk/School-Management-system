from rest_framework import serializers
from accounts.models import AcademicYear
from .models import FeeStructure, Invoice, Payment

class InvoiceSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.user.get_full_name', read_only=True)
    student_id = serializers.IntegerField(source='student.id', read_only=True)
    is_overdue = serializers.BooleanField(read_only=True)
    paid_amount = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    balance_due = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = Invoice
        fields = ('id', 'student', 'student_id', 'student_name', 'amount', 'status', 'due_date', 'created_at', 'is_overdue', 'void_reason', 'voided_at', 'academic_year', 'term', 'paid_amount', 'balance_due')
        read_only_fields = ('id', 'status', 'created_at', 'is_overdue', 'void_reason', 'voided_at', 'paid_amount', 'balance_due')

    def validate_student(self, student):
        request = self.context.get('request')
        if request and student.school_id != request.user.school_id:
            raise serializers.ValidationError('You can only invoice students in your school.')
        return student


class FeeStructureSerializer(serializers.ModelSerializer):
    class Meta:
        model = FeeStructure
        fields = ('id', 'academic_year', 'term', 'title', 'class_name', 'amount', 'due_date', 'is_active')
        read_only_fields = ('id',)

    def validate_academic_year(self, academic_year):
        if academic_year.school_id != self.context['request'].user.school_id:
            raise serializers.ValidationError('Academic year must belong to your school.')
        return academic_year

    def validate(self, attrs):
        year = attrs.get('academic_year', getattr(self.instance, 'academic_year', None))
        term = attrs.get('term', getattr(self.instance, 'term', None))
        if year and term and term.academic_year_id != year.pk:
            raise serializers.ValidationError({'term': 'Term must belong to the selected academic year.'})
        return attrs


class PaymentSerializer(serializers.ModelSerializer):
    invoice_id = serializers.IntegerField(source='invoice.id', read_only=True)
    student_name = serializers.CharField(source='invoice.student.user.get_full_name', read_only=True)

    class Meta:
        model = Payment
        fields = ('id', 'invoice', 'invoice_id', 'student_name', 'amount', 'method', 'reference', 'received_at')
        read_only_fields = ('id', 'invoice_id', 'student_name', 'received_at')

    def validate(self, attrs):
        request = self.context['request']
        invoice = attrs.get('invoice')
        if invoice and invoice.school_id != request.user.school_id:
            raise serializers.ValidationError({'invoice': 'Invoice must belong to your school.'})
        if invoice and attrs.get('amount', 0) > invoice.balance_due:
            raise serializers.ValidationError({'amount': 'Payment cannot exceed the invoice balance.'})
        return attrs

    def create(self, validated_data):
        user = self.context['request'].user
        return Payment.objects.create(
            school=user.school,
            received_by=user,
            **validated_data,
        )
