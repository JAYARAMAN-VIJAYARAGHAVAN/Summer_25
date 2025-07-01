package com.example.hms.controller;

import com.example.hms.dto.AppointmentRequest;
import com.example.hms.dto.AppointmentResponse;
import com.example.hms.dto.DoctorViewAppointmentResponse;
import com.example.hms.dto.RescheduleRequest;
import com.example.hms.entity.Appointment;
import com.example.hms.repository.AppointmentRepository;
import com.example.hms.service.AppointmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@CrossOrigin(origins = "*") // Restrict in production
public class AppointmentController {

    @Autowired
    private AppointmentService appointmentService;
    private AppointmentRepository appointmentRepository;

    // ✅ Get single appointment
    @GetMapping("/{id}")
    public ResponseEntity<?> getAppointmentById(@PathVariable Long id) {
        return appointmentService.getAppointmentById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ✅ Get all appointments for a patient
    @GetMapping("/patients/{patientId}")
    public ResponseEntity<List<AppointmentResponse>> getAppointmentsByPatient(@PathVariable Long patientId) {
        List<AppointmentResponse> appointments = appointmentService.getAppointmentsByPatientId(patientId);
        return ResponseEntity.ok(appointments);
    }

    // ✅ GET all BOOKED appointments for a doctor
    @GetMapping("/doctors/booked/{doctorId}")
    public ResponseEntity<List<DoctorViewAppointmentResponse>> getBookedAppointmentsByDoctor(@PathVariable Long doctorId) {
        List<DoctorViewAppointmentResponse> appointments = appointmentService.getDoctorAppointments(doctorId, Appointment.Status.BOOKED);
        return ResponseEntity.ok(appointments);
    }

    @GetMapping("/doctors/completed/{doctorId}")
    public ResponseEntity<List<DoctorViewAppointmentResponse>> getCompletedAppointmentsByDoctor(@PathVariable Long doctorId) {
        List<DoctorViewAppointmentResponse> appointments = appointmentService.getCompletedAppointmentsByDoctorId(doctorId);
        return ResponseEntity.ok(appointments);
    }


    @GetMapping("/doctors/requested/{doctorId}")
    public ResponseEntity<List<DoctorViewAppointmentResponse>> getRequestedAppointmentsForDoctor(@PathVariable Long doctorId) {
        List<DoctorViewAppointmentResponse> appointments = appointmentService.getDoctorAppointments(doctorId, Appointment.Status.REQUESTED);
        return ResponseEntity.ok(appointments);
    }



    // ✅ Get all available appointments
    @GetMapping("/available")
    public ResponseEntity<List<AppointmentResponse>> getAvailableAppointments() {
        List<AppointmentResponse> appointments = appointmentService.getAvailableAppointments();
        return ResponseEntity.ok(appointments);
    }

    // ✅ Request new appointment
    @PostMapping("/request")
    public ResponseEntity<?> createAppointment(@RequestBody AppointmentRequest request) {
        try {
            Appointment appointment = appointmentService.createAppointment(request);
            return ResponseEntity.ok(appointment);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ✅ FIXED PATH: Cancel appointment
    @PostMapping("/{appointmentId}/cancel")
    public ResponseEntity<String> cancelAppointment(@PathVariable Long appointmentId) {
        boolean result = appointmentService.cancelAppointment(appointmentId);
        return result ? ResponseEntity.ok("Appointment cancelled successfully.")
                      : ResponseEntity.badRequest().body("Cancellation failed.");
    }

    // ✅ FIXED PATH: Reschedule appointment
    @PostMapping("/reschedule")
    public ResponseEntity<String> rescheduleAppointment(@RequestBody RescheduleRequest request) {
        boolean result = appointmentService.rescheduleAppointment(request);
        return result ? ResponseEntity.ok("Appointment rescheduled successfully.")
                      : ResponseEntity.badRequest().body("Rescheduling failed.");
    }

    @PutMapping("/{appointmentId}/status")
    public ResponseEntity<String> updateAppointmentStatus(
            @PathVariable Long appointmentId,
            @RequestParam("status") Appointment.Status status) {
        try {
            appointmentService.handleStatusUpdate(appointmentId, status);
            return ResponseEntity.ok("Appointment updated to " + status);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{appointmentId}")
    public ResponseEntity<?> deleteAppointment(@PathVariable Long appointmentId) {
        appointmentService.deleteAppointmentById(appointmentId);
        return ResponseEntity.ok("Appointment deleted successfully");
    }

    
}
